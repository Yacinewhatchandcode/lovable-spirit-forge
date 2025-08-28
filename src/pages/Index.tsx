import { ParticleField } from '@/components/ParticleField';
import { Chat } from '@/components/Chat';

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col text-crisp android-text-size mobile-safe-area">
      <ParticleField />

      {/* Hero Section */}
      <div className="relative z-10 flex-shrink-0 text-center py-6 sm:py-8 px-3 sm:px-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-cinzel font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2 sm:mb-3">
          Spiritual Quest
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-cormorant">
          Discover hidden wisdom through meaningful conversations
        </p>
      </div>

      {/* Main Chat Container */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-5xl h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)] bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg rounded-2xl overflow-hidden">
          <Chat />
        </div>
      </div>
    </div>
  );
};

export default Index;