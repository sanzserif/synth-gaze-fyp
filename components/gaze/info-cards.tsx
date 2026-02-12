import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { GithubIcon } from "./icons";

export function InfoCards() {
  return (
    <div className="masonry">
      {/* Research Details */}
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
            Bi-Directional Coordinates and Eye-Gaze Prediction on Synthetic
            Data-Based Eye Gaze Tracking
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

      {/* Student Details */}
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

      {/* Model Architecture */}
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
              <span className="text-foreground">ResNet-18</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Head</span>
              <span className="text-foreground font-mono text-xs">
                Linear(512, 2)
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Input Size</span>
              <span className="text-foreground font-mono text-xs">
                64 × 64 × 3
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Output</span>
              <span className="text-foreground font-mono text-xs">(X, Y)</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Transfer Learning</span>
              <span className="text-foreground">ImageNet Pretrained</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training Configuration */}
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
              <span className="text-foreground">MSE</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Optimizer</span>
              <span className="text-foreground font-mono text-xs">
                Adam (lr=0.001)
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Epochs</span>
              <span className="text-foreground">5</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Batch Size</span>
              <span className="text-foreground">128</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training Data */}
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
              <span className="text-foreground">Unity (5K samples)</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Real</span>
              <span className="text-foreground">ARGaze (~2.6M samples)</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Training Cap</span>
              <span className="text-foreground font-mono text-xs">40,000</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preprocessing Pipeline */}
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
              <span className="text-muted-foreground">Resize → 64×64</span>
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

      {/* Stack */}
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
            <Badge variant="secondary">ResNet-18</Badge>
            <Badge variant="secondary">Vercel</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Runtime */}
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
              <span>Normalization</span>
              <span className="text-foreground font-mono text-xs">
                ImageNet
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
