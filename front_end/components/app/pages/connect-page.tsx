import React from 'react';
import { Card, CardTitle, CardHeader, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Banknote, CreditCard, CheckCircle, Plus } from 'lucide-react';
import { MOCK_CONNECTED_ACCOUNTS } from '@/lib/mock-data';

export const ConnectPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-foreground">Connect Your Payments</h2>
      <p className="text-lg text-muted-foreground">Link your accounts to earn points automatically every time you spend.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="items-center text-center">
            <Banknote className="w-12 h-12 text-primary mb-4" />
            <CardTitle>Connect Bank Account</CardTitle>
            <CardDescription>Securely link via Plaid to track purchases.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full">Connect with Plaid</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="items-center text-center">
            <CreditCard className="w-12 h-12 text-primary mb-4" />
            <CardTitle>Link Credit/Debit Card</CardTitle>
            <CardDescription>Manually add card details to start earning.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="secondary" className="w-full">Add Card Manually</Button>
          </CardFooter>
        </Card>
      </div>

      <h3 className="text-2xl font-semibold text-foreground/90 pt-6">Connected Accounts</h3>
      <Card>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {MOCK_CONNECTED_ACCOUNTS.map(account => (
              <li key={account.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <account.icon className="w-6 h-6 text-primary mr-3" />
                  <div>
                    <div className="font-semibold">{account.provider}</div>
                    <div className="text-sm text-muted-foreground">**** **** **** {account.lastFour}</div>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </li>
            ))}
            <li className="p-4">
              <Button variant="outline" className="w-full border-dashed">
                <Plus className="w-5 h-5 mr-2" />
                Link Another Account
              </Button>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
