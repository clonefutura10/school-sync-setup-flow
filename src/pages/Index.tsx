
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthContext } from '@/components/AuthProvider';
import { 
  GraduationCap, 
  Users, 
  Calendar, 
  BarChart3, 
  BookOpen, 
  Clock,
  ArrowRight,
  CheckCircle,
  Sparkles
} from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Student Management",
      description: "Comprehensive student records and enrollment management"
    },
    {
      icon: <Calendar className="h-8 w-8 text-green-600" />,
      title: "Academic Calendar",
      description: "Plan terms, breaks, and important academic events"
    },
    {
      icon: <BookOpen className="h-8 w-8 text-purple-600" />,
      title: "Curriculum Planning",
      description: "Organize subjects, classes, and teacher assignments"
    },
    {
      icon: <Clock className="h-8 w-8 text-orange-600" />,
      title: "Timetable Management",
      description: "Create and manage class schedules and time slots"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-red-600" />,
      title: "Analytics & Reports",
      description: "Insights and reports for better decision making"
    },
    {
      icon: <Sparkles className="h-8 w-8 text-indigo-600" />,
      title: "AI-Powered Setup",
      description: "Smart suggestions and automated data generation"
    }
  ];

  const setupSteps = [
    "School Information & Account Creation",
    "Academic Calendar Configuration", 
    "Infrastructure & Room Setup",
    "Student Registration",
    "Teacher Management",
    "Subject & Class Organization",
    "Timetable Creation",
    "Final Review & Launch"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-800">EduManage</span>
          </div>
          <Button 
            onClick={() => navigate('/setup')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Complete School Management
            <span className="text-blue-600 block">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Streamline your educational institution with our comprehensive management system. 
            From student enrollment to timetable creation, we've got everything covered.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
              onClick={() => navigate('/setup')}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Start Your School Setup
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-3"
            >
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Everything You Need to Manage Your School
          </h2>
          <p className="text-gray-600 text-lg">
            Powerful features designed specifically for educational institutions
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-gray-50 rounded-full w-fit">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Setup Process */}
      <section className="bg-white/50 backdrop-blur-sm py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Quick & Easy Setup Process
            </h2>
            <p className="text-gray-600 text-lg">
              Get your school management system running in just a few steps
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {setupSteps.map((step, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{step}</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button 
              size="lg" 
              className="bg-green-600 hover:bg-green-700 text-lg px-8 py-3"
              onClick={() => navigate('/setup')}
            >
              Begin Setup Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <GraduationCap className="h-6 w-6" />
            <span className="text-xl font-bold">EduManage</span>
          </div>
          <p className="text-gray-400">
            Empowering educational institutions with modern management tools
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
