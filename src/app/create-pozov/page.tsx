"use client";

import { FilePreview } from "@/components/file-preview";
import FileUpload03 from "@/components/file-upload";
import { JsonPreview } from "@/components/json-preview";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTrigger,
} from "@/components/ui/stepper";
import { extractPozovData } from "@/lib/ai";
import { extractDataSchema } from "@/lib/ai-configs/create-pozov-config";
import { filesAtom, pozovDataAtom } from "@/state/create-pozov";
import { atom, useAtom } from "jotai";
import { useCallback, useEffect, useState } from "react";
import { Packer } from "docx";
import { saveAs } from "file-saver";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const steps = [1, 2, 3] as const;

const stepAtom = atom<1 | 2 | 3>(1);

const stepNames = {
  1: "Оберіть файли для позову",
  2: "Витягніть дані для створення позову",
  3: "Генерація позову",
};

const stepElements = {
  1: <FirstStep />,
  2: <SecondStep />,
  3: <ThirdStep />,
};

export default function Page() {
  const [currentStep, setCurrentStep] = useAtom(stepAtom);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-4">
        <CardHeader className="text-center mx-20">
          <CardTitle>Створення Позову</CardTitle>
          <CardDescription>
            Заповніть 3 прості кроки для створення юридичного позову
          </CardDescription>
          <Stepper
            value={currentStep}
            onValueChange={(v) => setCurrentStep(v as 1 | 2 | 3)}
            className="space-y-8"
          >
            <StepperNav>
              {steps.map((step) => (
                <StepperItem key={step} step={step}>
                  <StepperTrigger asChild>
                    <StepperIndicator className="data-[state=completed]:bg-green-500 data-[state=completed]:text-white data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:text-gray-500">
                      {step}
                    </StepperIndicator>
                  </StepperTrigger>
                  {steps.length > step && (
                    <StepperSeparator className="group-data-[state=completed]/step:bg-green-500" />
                  )}
                </StepperItem>
              ))}
            </StepperNav>

            <StepperPanel className="text-sm">
              {steps.map((step) => (
                <StepperContent
                  className="w-full flex items-center justify-center"
                  key={step}
                  value={step}
                >
                  {stepNames[step]}
                </StepperContent>
              ))}
            </StepperPanel>
          </Stepper>
        </CardHeader>
        {stepElements[currentStep]}
      </Card>
    </div>
  );
}

function FirstStep() {
  const [_, setCurrentStep] = useAtom(stepAtom);
  const [files] = useAtom(filesAtom);

  return (
    <>
      <CardContent className="space-y-6">
        <div className="w-full">
          <FileUpload03 />
        </div>
      </CardContent>
      <CardFooter className="pb-4">
        <div className="flex justify-end w-full">
          <Button
            onClick={() => setCurrentStep(2)}
            disabled={files.length == 0}
          >
            Наступний крок
          </Button>
        </div>
      </CardFooter>
    </>
  );
}

function SecondStep() {
  const [_currentStep, setCurrentStep] = useAtom(stepAtom);
  const [files] = useAtom(filesAtom);
  const [pozovData, setPozovData] = useAtom(pozovDataAtom);
  const [extractionState, setExtractionState] = useState<
    "none" | "loading" | "success" | "failed"
  >("none");

  const extractData = useCallback(() => {
    setExtractionState("loading");

    extractPozovData(files)
      .then(async (data) => {
        if (!data) {
          setExtractionState("failed");
          return;
        }

        const parsed = await extractDataSchema.parseAsync(data);

        console.log(parsed);

        if (!parsed.success || parsed?.data == undefined) {
          setExtractionState("failed");
          setPozovData(parsed);
          return;
        }

        setExtractionState("success");
        setPozovData(parsed);
      })
      .catch((err) => {
        console.error(err);
        setExtractionState("failed");
      });

    setTimeout(() => {
      if (extractionState == "loading") {
        setExtractionState("failed");
        console.error("timed out");
      }
    }, 60000);
  }, [files, extractionState, setPozovData]);

  return (
    <>
      <CardContent className="space-y-6 p-20">
        <Carousel className="w-full">
          <CarouselContent className="min-h-96">
            {files.map((file, i) => (
              <CarouselItem className="min-h-full p-5" key={i}>
                <FilePreview file={file} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        <div className="flex justify-center">
          <Button
            className="mt-4"
            onClick={extractData}
            disabled={extractionState === "loading"}
          >
            Витягнути дані
          </Button>
        </div>

        <DataPreview state={extractionState} />
      </CardContent>
      <CardFooter className="pb-4">
        <div className="flex justify-around w-full">
          <Button variant={"secondary"} onClick={() => setCurrentStep(1)}>
            Повернутись
          </Button>
          <Button onClick={() => setCurrentStep(3)} disabled={!pozovData?.data}>
            Згенерувати Позов
          </Button>
        </div>
      </CardFooter>
    </>
  );
}

function DataPreview({
  state,
}: {
  state: "none" | "loading" | "success" | "failed";
}) {
  const [pozovData, setPozovData] = useAtom(pozovDataAtom);

  useEffect(() => console.log(pozovData, state), [pozovData, state]);

  if (state == "loading") {
    return <Skeleton className="w-full h-32" />;
  }

  if (!pozovData) return;

  if (state == "success" || pozovData.data) {
    return (
      <div>
        <Alert variant={"destructive"}>
          <Card>
            <CardContent>{pozovData?.message}</CardContent>
          </Card>
        </Alert>
        <JsonPreview
          data={pozovData.data}
          keyLabel="полів"
          itemLabel="предметів"
          trueLabel="Так"
          falseLabel="Ні"
          onChange={(nv) => setPozovData({ ...pozovData, data: nv })}
          className="mt-4"
        />
      </div>
    );
  }

  if (!pozovData.success && pozovData.message) {
    return (
      <Alert variant={"destructive"}>
        <Card>
          <CardContent>{pozovData?.message}</CardContent>
        </Card>
      </Alert>
    );
  }

  return <></>;
}

function ThirdStep() {
  const [_, setCurrentStep] = useAtom(stepAtom);
  const [pozovData] = useAtom(pozovDataAtom);
  const [files] = useAtom(filesAtom);
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [docxFile, setDocxFile] = useState<File | null>(null);

  const generatePozovDocument = useCallback(async () => {
    if (!pozovData?.data) return;

    setIsGenerating(true);
    setGeneratedContent("");
    setDocxFile(null);

    try {
      const response = await fetch("/api/ai/generate-pozov", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pozovData }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate document");
      }

      const result = await response.text();
      setGeneratedContent(result);

      // Generate DOCX using the function from lib
      const { generatePozovDocx } = await import("@/lib/generatePozovDocx");
      const doc = generatePozovDocx(result);

      // Convert to blob and create File
      const blob = await Packer.toBlob(doc);
      const docxFileObj = new File([blob], "pozov.docx", {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      setDocxFile(docxFileObj);
    } catch (error) {
      console.error("Error generating document:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [pozovData]);

  const saveDocument = useCallback(() => {
    if (docxFile) {
      saveAs(
        docxFile,
        `позов ${pozovData?.data?.["ПІБ позивача"] ?? "pozov"}.docx`,
      );
    }
  }, [docxFile, pozovData]);

  useEffect(() => {
    if (pozovData?.data && !generatedContent) {
      generatePozovDocument();
    }
  }, [pozovData, generatePozovDocument, generatedContent]);

  return (
    <>
      <CardContent className="space-y-6">
        {files.length > 0 && (
          <div>
            <h4 className="mb-4 font-medium text-foreground">
              Завантажені документи
            </h4>
            <Carousel className="w-full">
              <CarouselContent className="min-h-96">
                {files.map((file, i) => (
                  <CarouselItem className="min-h-full p-5" key={i}>
                    <FilePreview file={file} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        )}
        <div className="w-full min-h-96 p-4 border rounded-md">
          {isGenerating ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Skeleton className="w-full h-32 mb-4" />
                <p>Генерація позову...</p>
              </div>
            </div>
          ) : docxFile ? (
            <div className="max-h-96 overflow-auto">
              <FilePreview file={docxFile} />
            </div>
          ) : (
            <div className="whitespace-pre-wrap">
              {generatedContent || (
                <div className="text-gray-500 text-center">
                  Натисніть Згенерувати позов для створення документа
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pb-4">
        <div className="flex justify-between w-full">
          <Button variant="secondary" onClick={() => setCurrentStep(2)}>
            Повернутись
          </Button>
          <Button
            onClick={docxFile ? saveDocument : generatePozovDocument}
            disabled={isGenerating || !pozovData?.data}
          >
            {isGenerating
              ? "Генерація..."
              : docxFile
                ? "Зберегти документ"
                : "Згенерувати позов"}
          </Button>
        </div>
      </CardFooter>
    </>
  );
}
