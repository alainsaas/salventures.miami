const Unsubscribe = () => {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground mb-3">Unsubscribe</h1>
        <p className="text-muted-foreground">
          Email subscriptions are no longer managed on this site. If you're
          still receiving messages, reply to any of them and we'll remove you.
        </p>
      </div>
    </main>
  );
};

export default Unsubscribe;
