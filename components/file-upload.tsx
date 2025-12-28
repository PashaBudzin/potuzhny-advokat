"use client";

import { File, Trash } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAtom } from "jotai";
import { filesAtom } from "@/state/create-pozov";

export default function FileUpload03() {
  const [files, setFiles] = useAtom(filesAtom);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => setFiles([...files, ...acceptedFiles]),
  });

  const filesList = files.map((file) => (
    <li key={file.name} className="relative">
      <Card className="relative p-4">
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Remove file"
            onClick={() =>
              setFiles((prevFiles) =>
                prevFiles.filter((prevFile) => prevFile.name !== file.name),
              )
            }
          >
            <Trash className="h-5 w-5" aria-hidden={true} />
          </Button>
        </div>
        <CardContent className="flex items-center space-x-3 p-0">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
            <File className="h-5 w-5 text-foreground" aria-hidden={true} />
          </span>
          <div>
            <p className="font-medium text-foreground">{file.name}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {file.size} bytes
            </p>
          </div>
        </CardContent>
      </Card>
    </li>
  ));

  return (
    <div className="flex items-center justify-center p-10">
      <Card className="sm:mx-auto sm:max-w-xl">
        <CardHeader>
          <CardTitle>Документи для позову</CardTitle>
          <CardDescription>Загрузіть документи для позову</CardDescription>
        </CardHeader>
        <CardContent>
          <form action="#" method="post">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
              <div className="col-span-full">
                <Label htmlFor="file-upload-2" className="font-medium">
                  Завантажте файли
                </Label>
                <div
                  {...getRootProps()}
                  className={cn(
                    isDragActive
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                      : "border-border",
                    "mt-2 flex justify-center rounded-md border border-dashed px-6 py-20 transition-colors duration-200",
                  )}
                >
                  <div>
                    <File
                      className="mx-auto h-12 w-12 text-muted-foreground/80"
                      aria-hidden={true}
                    />
                    <div className="mt-4 flex text-muted-foreground">
                      <p>Перетягніть або</p>
                      <label
                        htmlFor="file"
                        className="relative cursor-pointer rounded-sm pl-1 font-medium text-primary hover:text-primary/80 hover:underline hover:underline-offset-4"
                      >
                        <span>оберіть файли</span>
                        <input
                          {...getInputProps()}
                          id="file-upload-2"
                          name="file-upload-2"
                          type="file"
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">для завантаження</p>
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-sm leading-5 text-muted-foreground sm:flex sm:items-center sm:justify-between">
                  <span>Усі типи файлів</span>
                  <span className="pl-1 sm:pl-0">
                    Макс. розмір на файл: 50MB
                  </span>
                </p>
                {filesList.length > 0 && (
                  <>
                    <h4 className="mt-6 font-medium text-foreground">
                      File(s) to upload
                    </h4>
                    <ul role="list" className="mt-4 space-y-4">
                      {filesList}
                    </ul>
                  </>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
