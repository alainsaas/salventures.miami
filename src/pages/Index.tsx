import { motion } from "framer-motion";
import salLogo from "@/assets/sal-ventures-logo.png";
// import ContactForm from "@/components/ContactForm";


const Index = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden bg-grid">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[120px]" />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-accent/3 blur-[100px] animate-pulse-glow" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-20">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12"
        >
          <img
            src={salLogo}
            alt="SAL Ventures"
            className="w-64 md:w-80 h-auto drop-shadow-[0_0_40px_hsl(175_80%_50%/0.15)]"
          />
        </motion.div>

        {/* Vision statement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="max-w-2xl text-center"
        >
          <p className="font-display text-lg md:text-xl lg:text-2xl font-light leading-relaxed tracking-wide text-foreground/80">
            We are entering a world where intelligence is ubiquitous. Companies will be fundamentally different.{" "}
            <span className="text-gradient-miami font-medium">
              We build for the post-execution economy
            </span>{" "}
            and explore what's coming next.
          </p>
        </motion.div>

        {/* Location tag */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-16 flex items-center gap-2 text-muted-foreground font-body text-sm tracking-[0.2em] uppercase"
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
          Miami
        </motion.div>

        {/* Contact section — disabled for static export
        <section id="contact" className="w-full max-w-3xl mt-32 md:mt-40">
          <ContactForm />
        </section>
        */}
      </div>


      {/* Subtle horizon line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </div>
  );
};

export default Index;
