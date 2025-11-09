import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Gift, TrendingUp, Sparkles } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
  <div className="bg-card p-6 rounded-lg shadow-sm border border-border/50 transition-all duration-300 hover:shadow-primary/20 hover:shadow-lg hover:-translate-y-2">
    <div className="flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-full mb-4">
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-b border-border z-50">
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">HousrCash</h1>
          <div className="space-x-2">
            <Button asChild variant="ghost">
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 text-center overflow-hidden">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background/0 to-background/100 -z-10"
            aria-hidden="true"
          />
          <div className="container mx-auto px-4">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Split Bills, Not Friendships.
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              HousrCash makes sharing expenses with your roommates and friends simple. Track balances, settle debts, and earn cashback rewards on your everyday bills.
            </p>
            <div className="flex justify-center items-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <Button asChild size="lg" className="group transition-transform hover:scale-105">
                <Link href="/signup">
                  Get Started for Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-card/50 border-y">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Everything You Need for Shared Living</h2>
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">All the tools to manage your finances, without the awkward conversations.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={Users}
                title="Group Expense Splitting"
                description="Create groups for your apartment, trips, or friends. Add expenses and we'll do the math to split it equally."
              />
              <FeatureCard
                icon={TrendingUp}
                title="Clear Debt Tracking"
                description="Instantly see who owes who. Our clear breakdown shows your personal and group debts, so you're always square."
              />
              <FeatureCard
                icon={Gift}
                title="Earn Cashback Rewards"
                description="Pay your bills through HousrCash and earn points. Redeem them for gift cards, discounts, and more."
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Get Started in 3 Easy Steps</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-full text-2xl font-bold mb-4 ring-4 ring-primary/20">1</div>
                <h3 className="text-xl font-semibold mb-2">Create Your Group</h3>
                <p className="text-muted-foreground">Sign up and create a group. Invite your roommates or friends with a simple shareable code.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-full text-2xl font-bold mb-4 ring-4 ring-primary/20">2</div>
                <h3 className="text-xl font-semibold mb-2">Add Expenses</h3>
                <p className="text-muted-foreground">Paid for groceries or the internet bill? Add the expense in seconds and it's automatically split.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-full text-2xl font-bold mb-4 ring-4 ring-primary/20">3</div>
                <h3 className="text-xl font-semibold mb-2">Settle & Earn</h3>
                <p className="text-muted-foreground">Settle up with friends inside the app and earn points on your payments to redeem for awesome rewards.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 bg-gradient-to-b from-primary/5 to-transparent border-t">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Simplify Your Shared Expenses?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Stop chasing payments and start earning rewards. Join thousands of users who trust HousrCash to manage their finances.
            </p>
            <Button asChild size="lg" className="group transition-transform hover:scale-105 animate-pulse">
              <Link href="/signup">
                Sign Up Now
                <Sparkles className="w-5 h-5 ml-2 transition-transform group-hover:rotate-12" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-center text-muted-foreground">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-xl font-bold text-primary">HousrCash</h2>
          </div>
          <p>&copy; {new Date().getFullYear()} HousrCash. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}