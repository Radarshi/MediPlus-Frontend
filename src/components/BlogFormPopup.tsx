import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Mail, Pen, Pencil, User, X } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface BlogFormProps {
  isOpen: boolean;
  blogTitle: string;
}

const BlogForm: React.FC<BlogFormProps> = ({ isOpen }) => {
  const [formData, setFormData] = useState({
    author: '',
    title: '',
    email: '',
    category: '',
    content: ''
  });

  const navigate = useNavigate();
  if (!isOpen) return null;

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const response = await fetch(`${import.meta.env.BACKEND_URL}/api/blogs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!response.ok)
      throw new Error('Failed to submit enrollment');
    
    const data = await response.json();
    console.log('Server response:', data);
    alert('Blog was submitted successfully!');
    navigate('/health-blog')
  } catch (error) {
    console.error("Submitting blog form error",error);
    alert('There was an error submitting the blog.');
  }
};

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  setFormData(prev => ({
    ...prev,
    [e.target.name]: e.target.value }));
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <Card className="w-full max-w-lg bg-white shadow-2xl animate-scale-in">
        <CardHeader className="relative">
          <Button
            onClick={()=> navigate('/health-blog')}
            variant="outline"
            size="icon"
            className="absolute top-4 right-4"
          >
            <X size={16} />
          </Button>
          <CardTitle className="text-2xl font-bold text-gray-900 pr-12">
            Post your own blog
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="author" className="flex items-center gap-2">
                <User size={16} />
                Author Name
              </Label>
              <Input
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                placeholder="Author name"
                required
              />
            </div>

             <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2">
                <Pen size={16} />
                Title
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Title of the blog"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail size={16} />
                Email
              </Label>
              <Input
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your mail"
                required
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content" className="flex items-center gap-2">
                <Pencil size={16} />
                Content
              </Label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="w-max p-2 border rounded min-h-[120px]"
                placeholder='Enter your content here'
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="flex items-center gap-2">
                <Calendar size={16} />
                Choose Category
              </Label>
              <select  id="category"
                name="category"
               value={formData.category}
              onChange={handleChange} >
                <option value="">Select Category</option>
                <option value="health">Health & Fitness</option>
                <option value="nutrition">Nutrition & Diet</option>
                <option value="mentalhealth">Mental Health & Wellness</option>
                <option value="workout">Workout & Exercise</option>
                <option value="yoga">Yoga & Meditation</option>
                <option value="weightloss">Weight Loss & Management</option>
                <option value="healthyrecipes">Healthy Recipes</option>
                <option value="selfcare">Self Care & Lifestyle</option>
                <option value="medicalnews">Medical News & Research</option>
                <option value="holistic">Holistic & Alternative Medicine</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={()=> navigate('/health-blog')} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                Submit
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogForm;
