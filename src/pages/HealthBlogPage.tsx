import BlogDetailModal from '@/components/BlogDetailModal';
import BlogForm from '@/components/BlogFormPopup';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Calendar, Clock, Search, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HealthBlogPage = () => {
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBlogFormOpen, setIsBlogFormOpen] = useState(false);
  const [blogPosts,setblogPosts] = useState([]);


  const categories = [
    { id: 'all', name: 'All Articles', icon: '📚', count: 24 },
    { id: 'nutrition', name: 'Nutrition', icon: '🥗', count: 8 },
    { id: 'fitness', name: 'Fitness', icon: '💪', count: 6 },
    { id: 'mental-health', name: 'Mental Health', icon: '🧠', count: 5 },
    { id: 'wellness', name: 'Wellness', icon: '🌿', count: 5 }
  ];


  const featuredPosts = blogPosts.filter(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  const filteredPosts = regularPosts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleReadMore = (blog) => {
    setSelectedBlog(blog);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetch(`${import.meta.env.BACKEND_URL}/api/blogs`)
      .then((res) => res.json())
      .then((data) => setblogPosts(data));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Search and Categories */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Latest Health Insights</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Stay informed with expert advice, research-backed articles, and practical tips for a healthier lifestyle.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-8">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <button className='border-black'
            onClick={() => navigate('/post')}>
              <h1>Post</h1>
            </button>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full border-2 transition-all ${
                  selectedCategory === category.id
                    ? 'border-indigo-500 bg-indigo-500 text-white'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
                <span className="ml-2 text-sm opacity-75">({category.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Articles Slider */}
        {featuredPosts.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6">Top Featured Articles</h3>
            <Carousel className="w-full">
              <CarouselContent>
                {featuredPosts.map((post, index) => (
                  <CarouselItem key={post._id?.$oid || post._id}>
                    <motion.div key={post._id?.$oid || post._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
                        <CardContent className="p-0">
                          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-8">
                            <div className="text-6xl mb-4">{post.image}</div>
                            <div className="flex items-center gap-4 text-sm mb-4 opacity-90">
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {post.date}
                              </span>
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {post.readTime}
                              </span>
                              <span className="flex items-center">
                                <User className="w-4 h-4 mr-1" />
                                {post.author}
                              </span>
                            </div>
                            <h4 className="text-2xl font-bold mb-3">{post.title}</h4>
                            <p className="opacity-90 mb-4">{post.excerpt}</p>
                            <Button 
                              variant="secondary" 
                              className="bg-white text-indigo-600 hover:bg-gray-100"
                              onClick={() => handleReadMore(post)}
                            >
                              Read More
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        )}

        {/* Regular Articles */}
        <div>
          <h3 className="text-2xl font-bold mb-6">All Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post._id?.$oid || post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                  <CardHeader>
                    <div className="text-4xl mb-4">{post.image}</div>
                    <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.map((tag, idx) => (
                        <span key={`${post._id}-tag-${idx}`} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto">
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {post.author}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {post.readTime}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">{post.date}</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleReadMore(post)}
                        >
                          Read More
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📖</div>
              <h3 className="text-xl font-semibold mb-2">No articles found</h3>
              <p className="text-gray-600">Try adjusting your search or category filter.</p>
            </div>
          )}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16">
          <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Stay Updated with Health Tips</h3>
              <p className="mb-6 opacity-90">
                Get the latest health insights, tips, and expert advice delivered to your inbox weekly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  placeholder="Enter your email"
                  className="bg-white text-gray-900"
                />
                <Button variant="secondary" className="bg-white text-indigo-600 hover:bg-gray-100">
                  Subscribe
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Blog Detail Modal */}
      <BlogDetailModal
        post={selectedBlog}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

       <BlogForm
        isOpen={isBlogFormOpen}
        blogTitle="New Blog Post"
      />
    </div>
  );
};

export default HealthBlogPage;
