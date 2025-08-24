import React, { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Calendar,
  Users,
  Church,
  Send,
  MessageCircle,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const ContactPage: React.FC = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: "Message Sent!",
      description: "Thank you for reaching out. We'll get back to you soon.",
    });

    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  const contactInfo = [
    {
      icon: <Church className="h-6 w-6 text-blue-600" />,
      title: "Parish Office",
      details: ["Merisho Catholic Church", "P.O. Box 123, Kiambu", "Kenya"],
      action: "Visit Us",
    },
    {
      icon: <Phone className="h-6 w-6 text-green-600" />,
      title: "Phone",
      details: [
        "+254 712 345 678",
        "+254 733 456 789",
        "Office Hours: 8 AM - 5 PM",
      ],
      action: "Call Us",
    },
    {
      icon: <Mail className="h-6 w-6 text-purple-600" />,
      title: "Email",
      details: [
        "youth@merishoparish.org",
        "info@merishoparish.org",
        "Quick response within 24 hours",
      ],
      action: "Email Us",
    },
    {
      icon: <MapPin className="h-6 w-6 text-red-600" />,
      title: "Location",
      details: [
        "Merisho Village",
        "Kajiado County",
        "Near SGR Railway",
      ],
      action: "Get Directions",
    },
  ];

  const meetingTimes = [
    {
      day: "Sunday",
      time: "After 9:00 AM Mass",
      activity: "General Meeting & Fellowship",
      location: "Parish Hall",
    },
    {
      day: "Thursday",
      time: "6:00 PM - 8:00 PM",
      activity: "Bible Study Group",
      location: "Youth Center",
    },
    {
      day: "Saturday",
      time: "2:00 PM - 4:00 PM",
      activity: "Rosary & Adoration",
      location: "Main Church",
    },
    {
      day: "First Saturday",
      time: "10:00 AM - 12:00 PM",
      activity: "Community Service",
      location: "Various Locations",
    },
  ];

  const leadership = [
    {
      name: "Father Michael Kimani",
      role: "Spiritual Director",
      phone: "+254 722 123 456",
      email: "frmichael@nkoroiparish.org",
    },
    {
      name: "Mary Wanjiku",
      role: "Youth Coordinator",
      phone: "+254 733 234 567",
      email: "mary@merishoparish.org",
    },
    {
      name: "John Mwangi",
      role: "Secretary",
      phone: "+254 712 345 678",
      email: "john@merishoparish.org",
    },
    {
      name: "Grace Njeri",
      role: "Treasurer",
      phone: "+254 721 456 789",
      email: "grace@merishoparish.org",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-4 rounded-full">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Get in touch with St. Bakhita Catholic Youths. We'd love to hear
            from you and welcome you to our community
          </p>
        </div>

        {/* Contact Information */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-center mb-4">{info.icon}</div>
                  <CardTitle className="text-lg">{info.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {info.details.map((detail, idx) => (
                      <p key={idx} className="text-gray-600 text-sm">
                        {detail}
                      </p>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    {info.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Meeting Times */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Meeting Times
            </h2>
            <p className="text-lg text-gray-600">
              Join us for our regular gatherings and activities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {meetingTimes.map((meeting, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{meeting.day}</CardTitle>
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{meeting.time}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">
                        {meeting.activity}
                      </h4>
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{meeting.location}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact Form & Leadership */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Send className="h-5 w-5 mr-2 text-blue-600" />
                Send Us a Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) =>
                        handleInputChange("subject", e.target.value)
                      }
                      placeholder="What is this about?"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      handleInputChange("message", e.target.value)
                    }
                    placeholder="Tell us how we can help you..."
                    rows={5}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Leadership Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-600" />
                Leadership Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {leadership.map((leader, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {leader.name}
                        </h4>
                        <p className="text-sm text-blue-600">{leader.role}</p>
                      </div>
                      <Users className="h-5 w-5 text-gray-400" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-3 w-3 mr-2" />
                        <span>{leader.phone}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-3 w-3 mr-2" />
                        <span>{leader.email}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="mt-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
          <CardContent className="p-8 text-center">
            <Heart className="h-12 w-12 text-white mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Come and See!</h2>
            <p className="text-xl mb-6 max-w-2xl mx-auto">
              We invite you to join us for any of our meetings or activities.
              Experience the joy of Christian fellowship and grow in your faith
              with us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Calendar className="h-4 w-4 mr-2" />
                View Our Calendar
              </Button>
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Get Directions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContactPage;
