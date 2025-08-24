import React from 'react';
import { Link } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description, icon }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card className="shadow-xl">
          <CardContent className="p-12 text-center space-y-6">
            <div className="flex justify-center">
              {icon || <Construction className="h-16 w-16 text-blue-600" />}
            </div>
            
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-600 leading-relaxed">{description}</p>
            </div>

            <div className="space-y-4 pt-4">
              <p className="text-sm text-blue-600 font-medium">
                This section is currently under development
              </p>
              
              <div className="flex flex-col space-y-3">
                <Link to="/">
                  <Button className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
                
                <div className="text-xs text-gray-500 pt-2">
                  Continue prompting to help us build this page!
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlaceholderPage;
