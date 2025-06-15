
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, ChevronLeft, Sparkles, Info, Rocket } from "lucide-react";

interface TourStep {
  title: string;
  description: string;
  highlight: string;
  isNotice?: boolean;
}

interface DemoTourDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStep: TourStep;
  tourSteps: TourStep[];
  currentTourStep: number;
  nextTourStep: () => void;
  prevTourStep: () => void;
  closeDemoTour: () => void;
}

const DemoTourDialog = ({
  open,
  onOpenChange,
  currentStep,
  tourSteps,
  currentTourStep,
  nextTourStep,
  prevTourStep,
  closeDemoTour
}: DemoTourDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="bg-gradient-to-br from-slate-900 to-purple-900 border-purple-500/20 max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
      <DialogHeader className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={closeDemoTour}
          className="absolute -top-2 -right-2 text-white/60 hover:text-white hover:bg-white/10 w-8 h-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
        <DialogTitle className="text-xl md:text-2xl font-bold text-white flex items-center gap-3 pr-8">
          {currentStep.isNotice ? (
            <Info className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
          ) : (
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
          )}
          {currentStep.title}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 md:space-y-6">
        <DialogDescription className="text-slate-300 text-base md:text-lg leading-relaxed">
          {currentStep.description}
        </DialogDescription>
        {currentStep.isNotice && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-yellow-200 text-sm">
                <p className="font-medium mb-1">API Limitations</p>
                <p>
                  Due to platform restrictions, we can only track the total number of problems solved on each platform. Individual problem details and real-time progress tracking are not available through official APIs.
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentTourStep
                    ? "bg-purple-400 w-6 md:w-8"
                    : index < currentTourStep
                    ? "bg-purple-600"
                    : "bg-slate-600"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="ghost"
              onClick={prevTourStep}
              disabled={currentTourStep === 0}
              className="text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-50 text-sm md:text-base px-3 md:px-4 py-2"
            >
              <ChevronLeft className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </Button>
            {currentTourStep < tourSteps.length - 1 ? (
              <Button
                onClick={nextTourStep}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-sm md:text-base px-3 md:px-4 py-2"
              >
                Next
                <ChevronRight className="w-3 h-3 md:w-4 md:h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={closeDemoTour}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-sm md:text-base px-3 md:px-4 py-2"
              >
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Start</span>
                <Rocket className="w-3 h-3 md:w-4 md:h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

export default DemoTourDialog;
