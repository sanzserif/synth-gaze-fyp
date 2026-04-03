import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { GithubIcon } from "./icons";

export function InfoCards() {
  return (
    <div className="masonry">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle
            className="text-sm tracking-normal"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Research
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm font-medium">
            Vector-based eye-gaze estimation on synthetic and real eye data,
            deployed as an ONNX-backed web application.
          </p>
          <Separator />
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <span className="text-foreground/70">Supervisor:</span> Prof.
              Prasad Wimalaratne
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle
            className="text-sm tracking-normal"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Student
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-1.5">
            <p className="font-medium">Nipun Kariyawasam</p>
            <div className="text-muted-foreground space-y-0.5">
              <p>IIT ID: 20212143</p>
              <p>UOW ID: w1901979</p>
            </div>
            <Separator />
            <a
              href="https://github.com/sanzserif"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors pt-1"
            >
              <GithubIcon />
              sanzserif
            </a>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle
            className="text-sm tracking-normal"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Model Architecture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-1.5">
            <div className="flex justify-between text-muted-foreground">
              <span>Base Model</span>
              <span className="text-foreground">EfficientNet-B0</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Head</span>
              <span className="text-foreground font-mono text-xs">
                MLP → Tanh(2)
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Input Size</span>
              <span className="text-foreground font-mono text-xs">
                128 × 128 × 3
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Output</span>
              <span className="text-foreground font-mono text-xs">(theta, phi)</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Export</span>
              <span className="text-foreground">ONNX Runtime</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle
            className="text-sm tracking-normal"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Training Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-1.5">
            <div className="flex justify-between text-muted-foreground">
              <span>Loss Function</span>
              <span className="text-foreground">Huber</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Optimizer</span>
              <span className="text-foreground font-mono text-xs">
                AdamW (lr=3e-4)
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Epochs</span>
              <span className="text-foreground">18</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Batch Size</span>
              <span className="text-foreground">64</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle
            className="text-sm tracking-normal"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Training Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-1.5">
            <div className="flex justify-between text-muted-foreground">
              <span>Synthetic</span>
              <span className="text-foreground">UnityEyes2</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Real</span>
              <span className="text-foreground">MPIIGaze</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Training Mix</span>
              <span className="text-foreground font-mono text-xs">12K + 12K</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle
            className="text-sm tracking-normal"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Preprocessing Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] shrink-0">
                1
              </Badge>
              <span className="text-muted-foreground">Resize → 128×128</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] shrink-0">
                2
              </Badge>
              <span className="text-muted-foreground">Grayscale → 3ch RGB</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] shrink-0">
                3
              </Badge>
              <span className="text-muted-foreground">ToTensor [0, 1]</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] shrink-0">
                4
              </Badge>
              <span className="text-muted-foreground">
                Normalize (ImageNet)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle
            className="text-sm tracking-normal"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Stack
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary">Next.js</Badge>
            <Badge variant="secondary">TypeScript</Badge>
            <Badge variant="secondary">FastAPI</Badge>
            <Badge variant="secondary">ONNX Runtime</Badge>
            <Badge variant="secondary">Three.js</Badge>
            <Badge variant="secondary">EfficientNet-B0</Badge>
            <Badge variant="secondary">Vercel</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle
            className="text-sm tracking-normal"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Runtime
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-1.5">
            <div className="flex justify-between text-muted-foreground">
              <span>Inference Engine</span>
              <span className="text-foreground">ONNX Runtime</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Raycast View</span>
              <span className="text-foreground font-mono text-xs">
                Browser-side 3D
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Image Input</span>
              <span className="text-foreground font-mono text-xs">
                Upload only
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
