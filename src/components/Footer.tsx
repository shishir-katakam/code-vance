
const Footer = () => {
  return (
    <footer className="bg-black/20 backdrop-blur-md border-t border-white/10 mt-auto">
      <div className="container mx-auto px-6 py-4">
        <p className="text-center text-gray-300 text-sm">
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
    </footer>
  );
};

export default Footer;
