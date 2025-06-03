export default function ServerErrorPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Server Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-16 bg-foreground/10 rounded-lg border-2 border-foreground/20">
              <div className="absolute top-2 left-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <div className="absolute top-2 right-2 w-2 h-2 bg-foreground/30 rounded-full"></div>
              <div className="absolute bottom-2 left-2 right-2 h-1 bg-foreground/20 rounded"></div>
            </div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-3 bg-foreground/10 rounded-b"></div>
          </div>
        </div>

        {/* Error Code */}
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-foreground/80">500</h1>
          <h2 className="text-2xl font-semibold text-foreground">
            Server Error
          </h2>
        </div>

        {/* Description */}
        <div className="space-y-4">
          <p className="text-foreground/70 leading-relaxed">
            Our servers are currently experiencing technical difficulties. We're
            working hard to resolve this issue.
          </p>

          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors duration-200 font-medium cursor-pointer"
          >
            Try Again
          </button>
        </div>

        {/* Additional Info */}
        <div className="pt-8 text-sm text-foreground/50">
          <p>If the problem persists, please contact support.</p>
        </div>
      </div>
    </div>
  );
}
