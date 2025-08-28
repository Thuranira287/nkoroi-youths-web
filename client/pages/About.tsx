import React from "react";
import {
  Cross,
  Heart,
  Users,
  Star,
  Book,
  Calendar,
  MapPin,
  Clock,
  Phone,
  Mail,
  Church,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AboutPage: React.FC = () => {
  const activities = [
    {
      icon: <Book className="h-6 w-6 text-blue-600" />,
      title: "Bible Study",
      description:
        "Weekly Scripture study sessions exploring God's word together",
      schedule: "Thursdays 6:00 PM",
    },
    {
      icon: <Cross className="h-6 w-6 text-purple-600" />,
      title: "Holy Rosary",
      description:
        "Daily rosary prayers and meditation on the mysteries of Christ",
      schedule: "Daily after Evening Mass",
    },
    {
      icon: <Users className="h-6 w-6 text-green-600" />,
      title: "Fellowship",
      description:
        "Monthly gatherings for food, games, and Christian fellowship",
      schedule: "First Saturday of each month",
    },
    {
      icon: <Church className="h-6 w-6 text-red-600" />,
      title: "Pilgrimages",
      description: "Annual trips to sacred sites and Catholic shrines",
      schedule: "Twice yearly",
    },
    {
      icon: <Heart className="h-6 w-6 text-pink-600" />,
      title: "Community Service",
      description: "Outreach programs serving our local community",
      schedule: "Monthly service projects",
    },
    {
      icon: <Star className="h-6 w-6 text-yellow-600" />,
      title: "Youth Retreats",
      description: "Spiritual retreats for prayer, reflection, and growth",
      schedule: "Quarterly",
    },
  ];

  const leadership = [
    {
      name: "Father Michael Kimani",
      role: "Spiritual Director",
      description:
        "Our beloved parish priest who guides us in our spiritual journey",
    },
    {
      name: "Mary Wanjiku",
      role: "Youth Coordinator",
      description:
        "Coordinates youth activities and organizes our community events",
    },
    {
      name: "John Mwangi",
      role: "Secretary",
      description: "Handles communication and maintains group records",
    },
    {
      name: "Grace Njeri",
      role: "Treasurer",
      description: "Manages group finances and fundraising activities",
    },
  ];

  const values = [
    {
      title: "Faith",
      description:
        "Growing in our relationship with Jesus Christ through prayer, Scripture, and the sacraments",
      icon: <Cross className="h-8 w-8 text-blue-600" />,
    },
    {
      title: "Fellowship",
      description:
        "Building lasting friendships and supporting one another in our faith journey",
      icon: <Users className="h-8 w-8 text-green-600" />,
    },
    {
      title: "Service",
      description:
        "Following Christ's example by serving others, especially those in need",
      icon: <Heart className="h-8 w-8 text-red-600" />,
    },
    {
      title: "Formation",
      description:
        "Continuous learning and growth in Catholic teaching and tradition",
      icon: <Book className="h-8 w-8 text-purple-600" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-4 rounded-full">
              <Cross className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About St. Bakhita Catholic Youths
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            A vibrant community of young Catholics in Nkoroi Parish, united in
            faith, fellowship, and service to Christ and His Church
          </p>
        </div>

        {/* Mission Statement */}
        <Card className="mb-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-xl leading-relaxed max-w-4xl mx-auto">
              To foster spiritual growth, Christian fellowship, and active
              service among the young people of Merisho Parish, inspiring them
              to live as authentic disciples of Jesus Christ and become leaders
              in their communities.
            </p>
          </CardContent>
        </Card>

        {/* Our Values */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-gray-600">
              The pillars that guide our community and activities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">{value.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Activities */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Activities
            </h2>
            <p className="text-lg text-gray-600">
              Regular programs that strengthen our faith and community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activities.map((activity, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    {activity.icon}
                    <CardTitle className="text-lg">{activity.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{activity.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{activity.schedule}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* History & Background */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  St. Bakhita Catholic Youths was founded in 2018 by a group of
                  passionate young Catholics who desired to create a vibrant
                  community for spiritual growth and fellowship at Nkoroi
                  Parish. Named after St. Josephine Bakhita, the patron saint of
                  Sudan and human trafficking survivors, our group embodies her
                  spirit of faith, hope, and service.
                </p>
                <p>
                  What started as a small group of 15 young people has grown
                  into a thriving community of over 80 active members aged
                  16-35. We have organized numerous successful pilgrimages,
                  community service projects, and spiritual retreats that have
                  touched the lives of many in our parish and beyond.
                </p>
                <p>
                  Under the spiritual guidance of our parish priests and with
                  the support of our parish community, we continue to grow in
                  faith and witness to the Gospel through our words and actions.
                </p>
              </div>
            </div>

            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Quick Facts
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Founded</span>
                    <Badge variant="outline">2018</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Active Members</span>
                    <Badge variant="outline">80+</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Age Range</span>
                    <Badge variant="outline">16-35 years</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Pilgrimages Organized</span>
                    <Badge variant="outline">12+</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Service Projects</span>
                    <Badge variant="outline">25+</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Leadership */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Leadership
            </h2>
            <p className="text-lg text-gray-600">
              Dedicated servants leading our community with faith and wisdom
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {leadership.map((leader, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{leader.name}</CardTitle>
                  <Badge variant="outline" className="mx-auto">
                    {leader.role}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">{leader.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact Info */}
        <Card className="bg-gray-50 border-0">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Join Our Community
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Are you a young Catholic looking for a community to grow in faith?
              We welcome new members who share our passion for Christ and
              service to others.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="flex items-center justify-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">Nkoroi Parish, Ngong</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">Sundays after 10:30AM Mass</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <Phone className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">Contact Parish Office</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AboutPage;
