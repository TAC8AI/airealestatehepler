'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSend, FiCopy, FiCheck } from 'react-icons/fi';
import { supabase } from '../../../lib/supabase';
import { generateMLSDescription, generateSocialMediaContent } from '../../../lib/openai';

interface PropertyDetails {
  title: string;
  address: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  squareFeet: string;
  yearBuilt: string;
  propertyType: string;
  features: string;
  description: string;
}

export default function GenerateListing() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails>({
    title: '',
    address: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    squareFeet: '',
    yearBuilt: '',
    propertyType: 'Single Family',
    features: '',
    description: '',
  });
  const [generatedContent, setGeneratedContent] = useState({
    mls: '',
    facebook: '',
    instagram: '',
    linkedin: '',
  });
  const [copied, setCopied] = useState({
    mls: false,
    facebook: false,
    instagram: false,
    linkedin: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPropertyDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate MLS description
      const mlsDescription = await generateMLSDescription(propertyDetails);
      
      // Generate social media content
      const facebookContent = await generateSocialMediaContent(propertyDetails, 'facebook');
      const instagramContent = await generateSocialMediaContent(propertyDetails, 'instagram');
      const linkedinContent = await generateSocialMediaContent(propertyDetails, 'linkedin');
      
      setGeneratedContent({
        mls: mlsDescription,
        facebook: facebookContent,
        instagram: instagramContent,
        linkedin: linkedinContent,
      });
      
      // Save to database
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data, error } = await supabase
          .from('listings')
          .insert([
            {
              user_id: session.user.id,
              title: propertyDetails.title,
              property_details: propertyDetails,
              mls_description: mlsDescription,
              facebook_content: facebookContent,
              instagram_content: instagramContent,
              linkedin_content: linkedinContent,
            },
          ])
          .select();
          
        if (error) {
          console.error('Error saving listing:', error);
        }
      }
      
      setStep(2);
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (type: keyof typeof copied) => {
    navigator.clipboard.writeText(generatedContent[type]);
    setCopied((prev) => ({ ...prev, [type]: true }));
    setTimeout(() => {
      setCopied((prev) => ({ ...prev, [type]: false }));
    }, 2000);
  };

  const handleCreateNew = () => {
    setPropertyDetails({
      title: '',
      address: '',
      price: '',
      bedrooms: '',
      bathrooms: '',
      squareFeet: '',
      yearBuilt: '',
      propertyType: 'Single Family',
      features: '',
      description: '',
    });
    setGeneratedContent({
      mls: '',
      facebook: '',
      instagram: '',
      linkedin: '',
    });
    setStep(1);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Generate Listing</h1>
      
      {step === 1 ? (
        <div className="card">
          <h2 className="text-lg font-medium mb-4">Property Details</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="label">Listing Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={propertyDetails.title}
                  onChange={handleChange}
                  className="input"
                  placeholder="Stunning Modern Home"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="address" className="label">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={propertyDetails.address}
                  onChange={handleChange}
                  className="input"
                  placeholder="123 Main St, City, State"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="price" className="label">Price</label>
                <input
                  type="text"
                  id="price"
                  name="price"
                  value={propertyDetails.price}
                  onChange={handleChange}
                  className="input"
                  placeholder="$499,000"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="propertyType" className="label">Property Type</label>
                <select
                  id="propertyType"
                  name="propertyType"
                  value={propertyDetails.propertyType}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="Single Family">Single Family</option>
                  <option value="Condo">Condo</option>
                  <option value="Townhouse">Townhouse</option>
                  <option value="Multi-Family">Multi-Family</option>
                  <option value="Land">Land</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="bedrooms" className="label">Bedrooms</label>
                <input
                  type="text"
                  id="bedrooms"
                  name="bedrooms"
                  value={propertyDetails.bedrooms}
                  onChange={handleChange}
                  className="input"
                  placeholder="3"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="bathrooms" className="label">Bathrooms</label>
                <input
                  type="text"
                  id="bathrooms"
                  name="bathrooms"
                  value={propertyDetails.bathrooms}
                  onChange={handleChange}
                  className="input"
                  placeholder="2"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="squareFeet" className="label">Square Feet</label>
                <input
                  type="text"
                  id="squareFeet"
                  name="squareFeet"
                  value={propertyDetails.squareFeet}
                  onChange={handleChange}
                  className="input"
                  placeholder="2,000"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="yearBuilt" className="label">Year Built</label>
                <input
                  type="text"
                  id="yearBuilt"
                  name="yearBuilt"
                  value={propertyDetails.yearBuilt}
                  onChange={handleChange}
                  className="input"
                  placeholder="2010"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="features" className="label">Key Features</label>
                <textarea
                  id="features"
                  name="features"
                  value={propertyDetails.features}
                  onChange={handleChange}
                  className="input h-24"
                  placeholder="Hardwood floors, granite countertops, updated kitchen, etc."
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="description" className="label">Additional Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={propertyDetails.description}
                  onChange={handleChange}
                  className="input h-32"
                  placeholder="Any additional details about the property..."
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="btn-primary flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <FiSend className="mr-2" />
                    Generate Content
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-8">
          {/* MLS Description */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">MLS Description</h2>
              <button
                onClick={() => handleCopy('mls')}
                className="text-primary-600 hover:text-primary-700 flex items-center text-sm"
              >
                {copied.mls ? (
                  <>
                    <FiCheck className="mr-1" /> Copied
                  </>
                ) : (
                  <>
                    <FiCopy className="mr-1" /> Copy
                  </>
                )}
              </button>
            </div>
            <div className="bg-secondary-50 p-4 rounded-md whitespace-pre-wrap">
              {generatedContent.mls}
            </div>
          </div>
          
          {/* Social Media Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Facebook */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Facebook</h2>
                <button
                  onClick={() => handleCopy('facebook')}
                  className="text-primary-600 hover:text-primary-700 flex items-center text-sm"
                >
                  {copied.facebook ? (
                    <>
                      <FiCheck className="mr-1" /> Copied
                    </>
                  ) : (
                    <>
                      <FiCopy className="mr-1" /> Copy
                    </>
                  )}
                </button>
              </div>
              <div className="bg-secondary-50 p-4 rounded-md mb-4 h-64 overflow-y-auto whitespace-pre-wrap">
                {generatedContent.facebook}
              </div>
              <div className="border border-secondary-200 rounded-md p-4 bg-white">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-3">
                    RE
                  </div>
                  <div>
                    <p className="font-medium text-sm">Real Estate Pro</p>
                    <p className="text-xs text-secondary-500">Just now</p>
                  </div>
                </div>
                <p className="text-sm mb-3 line-clamp-3">{generatedContent.facebook.substring(0, 100)}...</p>
                <div className="aspect-video bg-secondary-100 rounded-md flex items-center justify-center">
                  <span className="text-secondary-400">Property Image</span>
                </div>
              </div>
            </div>
            
            {/* Instagram */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Instagram</h2>
                <button
                  onClick={() => handleCopy('instagram')}
                  className="text-primary-600 hover:text-primary-700 flex items-center text-sm"
                >
                  {copied.instagram ? (
                    <>
                      <FiCheck className="mr-1" /> Copied
                    </>
                  ) : (
                    <>
                      <FiCopy className="mr-1" /> Copy
                    </>
                  )}
                </button>
              </div>
              <div className="bg-secondary-50 p-4 rounded-md mb-4 h-64 overflow-y-auto whitespace-pre-wrap">
                {generatedContent.instagram}
              </div>
              <div className="border border-secondary-200 rounded-md bg-white">
                <div className="aspect-square bg-secondary-100 flex items-center justify-center">
                  <span className="text-secondary-400">Property Image</span>
                </div>
                <div className="p-3">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-2">
                      RE
                    </div>
                    <p className="font-medium text-sm">realestatepro</p>
                  </div>
                  <p className="text-sm line-clamp-2">{generatedContent.instagram.substring(0, 80)}...</p>
                </div>
              </div>
            </div>
            
            {/* LinkedIn */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">LinkedIn</h2>
                <button
                  onClick={() => handleCopy('linkedin')}
                  className="text-primary-600 hover:text-primary-700 flex items-center text-sm"
                >
                  {copied.linkedin ? (
                    <>
                      <FiCheck className="mr-1" /> Copied
                    </>
                  ) : (
                    <>
                      <FiCopy className="mr-1" /> Copy
                    </>
                  )}
                </button>
              </div>
              <div className="bg-secondary-50 p-4 rounded-md mb-4 h-64 overflow-y-auto whitespace-pre-wrap">
                {generatedContent.linkedin}
              </div>
              <div className="border border-secondary-200 rounded-md p-4 bg-white">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-3">
                    RE
                  </div>
                  <div>
                    <p className="font-medium">Real Estate Professional</p>
                    <p className="text-xs text-secondary-500">Real Estate Agent • Just now</p>
                  </div>
                </div>
                <p className="text-sm mb-3 line-clamp-3">{generatedContent.linkedin.substring(0, 120)}...</p>
                <div className="aspect-video bg-secondary-100 rounded-md flex items-center justify-center">
                  <span className="text-secondary-400">Property Image</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="btn-secondary"
            >
              Edit Details
            </button>
            <button
              onClick={handleCreateNew}
              className="btn-primary"
            >
              Create New Listing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
