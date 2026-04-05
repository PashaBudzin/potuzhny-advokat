/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ChevronDown, ChevronRight } from "lucide-react";

interface TreePreviewProps {
  data: any;
  onChange?: (data: any) => void;
  className?: string;
  keyLabel?: string;
  itemLabel?: string;
  trueLabel?: string;
  falseLabel?: string;
}

interface TreeFieldProps {
  data: any;
  path: string;
  onChange: (path: string, value: any) => void;
  level: number;
  keyLabel?: string;
  itemLabel?: string;
  trueLabel?: string;
  falseLabel?: string;
}

const TreeField: React.FC<TreeFieldProps> = ({
  data,
  path,
  onChange,
  level,
  keyLabel = "Key",
  itemLabel = "item",
  trueLabel = "true",
  falseLabel = "false",
}) => {
  const [expanded, setExpanded] = useState(true);

  const isObject = data !== null && typeof data === "object";
  const isArray = Array.isArray(data);

  const handleChange = (newValue: unknown) => {
    onChange(path, newValue);
  };

  if (isObject) {
    const keys = Object.keys(data);

    return (
      <div className="border-l-2 border-border ml-1">
        <div className="flex items-center gap-1 py-0.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 hover:bg-muted"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {isArray
              ? `${keys.length} ${itemLabel}${keys.length === 1 ? "" : "s"}`
              : `${keys.length} ${keyLabel.toLowerCase()}`}
          </span>
        </div>

        {expanded && (
          <div className="ml-2 space-y-0.5">
            {isArray ? (
              <div className="space-y-0.5">
                {keys.map((key) => (
                  <div
                    key={key}
                    className="flex items-center gap-1 py-0.5 px-0.5 rounded hover:bg-muted/30"
                  >
                    <span className="text-xs text-muted-foreground min-w-6 text-center">
                      {parseInt(key) + 1}.
                    </span>
                    <div className="flex-1">
                      <TreeField
                        data={data[Number(key)]}
                        path={path ? `${path}[${key}]` : `[${key}]`}
                        onChange={onChange}
                        level={level + 1}
                        keyLabel={keyLabel}
                        itemLabel={itemLabel}
                        trueLabel={trueLabel}
                        falseLabel={falseLabel}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              keys.map((key) => (
                <div
                  key={key}
                  className="flex items-center gap-2 py-1 px-1 rounded hover:bg-muted/50"
                >
                  <span className="text-sm font-medium text-foreground min-w-20 max-w-40 flex-shrink-0 truncate overflow-x-auto">
                    {key}
                  </span>
                  <div className="flex-1">
                    <TreeField
                      data={data[key]}
                      path={path ? `${path}.${key}` : key}
                      onChange={onChange}
                      level={level + 1}
                      keyLabel={keyLabel}
                      itemLabel={itemLabel}
                      trueLabel={trueLabel}
                      falseLabel={falseLabel}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  const getValue = () => {
    if (typeof data === "boolean") {
      return String(data);
    }
    return String(data || "");
  };

  const isBoolean = typeof data === "boolean";

  if (isBoolean) {
    return (
      <Select
        value={getValue()}
        onValueChange={(value) => handleChange(value === "true")}
      >
        <SelectTrigger size="sm" className="h-7 text-xs w-fit">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="true">{trueLabel}</SelectItem>
          <SelectItem value="false">{falseLabel}</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  return (
    <Input
      value={getValue()}
      onChange={(e) => handleChange(e.target.value)}
      className="h-7 text-xs"
    />
  );
};

export const TreePreview: React.FC<TreePreviewProps> = ({
  data,
  onChange,
  className = "",
  keyLabel = "Key",
  itemLabel = "item",
  trueLabel = "true",
  falseLabel = "false",
}) => {
  const [treeData, setTreeData] = useState(data);

  const handleChange = (path: string, value: any) => {
    const newData = Array.isArray(treeData)
      ? [...treeData]
      : typeof treeData === "object" && treeData !== null
        ? { ...treeData }
        : value;

    if (path) {
      // Parse path that can contain both dot notation and array indices
      const parts = path.match(/([^\[\].]+)|\[(\d+)\]/g) || [];
      let current: any = newData;

      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        let key: string | number;

        if (part.startsWith("[")) {
          key = parseInt(part.slice(1, -1));
        } else {
          key = part;
        }

        if (current[key] === null || typeof current[key] !== "object") {
          current[key] = {};
        }
        current = current[key];
      }

      // Set the final value
      const lastPart = parts[parts.length - 1];
      let lastKey: string | number;

      if (lastPart.startsWith("[")) {
        lastKey = parseInt(lastPart.slice(1, -1));
      } else {
        lastKey = lastPart;
      }

      current[lastKey] = value;
    }

    setTreeData(newData);
    onChange?.(newData);
  };

  return (
    <Card className={`p-2 ${className}`}>
      <div className="space-y-1">
        <TreeField
          data={treeData}
          path=""
          onChange={handleChange}
          level={0}
          keyLabel={keyLabel}
          itemLabel={itemLabel}
          trueLabel={trueLabel}
          falseLabel={falseLabel}
        />
      </div>
    </Card>
  );
};

// Keep backward compatibility
export const JsonPreview = TreePreview;
