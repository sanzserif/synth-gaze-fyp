"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { XIcon } from "./icons";
import type { DebugLog } from "./types";

interface DebugPanelProps {
  logs: DebugLog[];
  onClose: () => void;
}

export function DebugPanel({ logs, onClose }: DebugPanelProps) {
  return (
    <Card className="mb-6 border-muted">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle
            className="text-sm font-medium tracking-normal"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Network Debug
          </CardTitle>
          <CardDescription>API request/response log</CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <XIcon />
        </Button>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No requests yet.</p>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {logs.map((log) => (
              <div
                key={log.id}
                className="text-xs font-mono bg-secondary/50 rounded-md p-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant={log.status === 200 ? "default" : "destructive"}
                    className="text-[10px] px-1.5 py-0"
                  >
                    {log.status ?? "ERR"}
                  </Badge>
                  <span className="text-muted-foreground">{log.method}</span>
                  <span className="text-foreground">{log.url}</span>
                  <span className="text-muted-foreground ml-auto">
                    {log.duration}ms
                  </span>
                  <span className="text-muted-foreground">{log.timestamp}</span>
                </div>
                {log.request && (
                  <div className="text-muted-foreground mt-1">
                    → {log.request}
                  </div>
                )}
                {log.response && (
                  <div className="text-foreground/80 mt-0.5">
                    ← {log.response}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
