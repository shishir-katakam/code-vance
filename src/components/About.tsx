
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

const About = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-white hover:bg-white/10">
          <Info className="h-4 w-4 mr-2" />
          About Me
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black/40 border-white/10 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-white">About Me</DialogTitle>
        </DialogHeader>
        <div className="text-gray-300">
          <p>
            This is a testing site made by Shishir. The actual site will be released soon. 
            If you face any problems then feel free to mail me: 
            <a 
              href="mailto:shishirkatakam8@gmail.com" 
              className="text-purple-400 hover:text-purple-300 ml-1"
            >
              shishirkatakam8@gmail.com
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default About;
