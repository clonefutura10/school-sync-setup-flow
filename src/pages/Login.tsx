
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, User, School } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Get stored school data
    const schoolData = localStorage.getItem('schedulerData');
    const schoolInfo = localStorage.getItem('schoolInfo');
    
    if (!schoolData && !schoolInfo) {
      toast({
        title: "No Setup Data Found",
        description: "Please complete the school setup first.",
        variant: "destructive",
        className: "fixed top-4 right-4 w-96 border-l-4 border-l-red-500",
      });
      setIsLoading(false);
      navigate('/');
      return;
    }

    // Parse school data to generate expected credentials
    let expectedUsername = '';
    try {
      const data = JSON.parse(schoolData || schoolInfo || '{}');
      const schoolName = data.name || 'School';
      expectedUsername = `admin_${schoolName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    } catch (error) {
      expectedUsername = 'admin_school';
    }

    // Simple credential validation (in a real app, this would be server-side)
    if (username === expectedUsername && password.length >= 8) {
      // Store login session
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('currentUser', username);
      
      toast({
        title: "Login Successful!",
        description: "Welcome to the School Management Dashboard",
        className: "fixed top-4 right-4 w-96 border-l-4 border-l-green-500",
      });
      
      // Navigate to dashboard
      navigate('/dashboard');
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid username or password. Please check your credentials.",
        variant: "destructive",
        className: "fixed top-4 right-4 w-96 border-l-4 border-l-red-500",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-blue-600 rounded-full">
              <School className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            School Management Login
          </CardTitle>
          <p className="text-gray-600">
            Enter your credentials to access the dashboard
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700 text-center">
              💡 <strong>Tip:</strong> Use the credentials generated during school setup to login.
            </p>
          </div>

          <div className="mt-4 text-center">
            <Button 
              variant="link" 
              onClick={() => navigate('/')}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              ← Back to Setup
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
