'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiSend, FiCopy, FiCheck, FiEdit3, FiHome, FiDollarSign, FiMapPin, FiCalendar, FiTrendingUp, FiStar, FiPlus, FiChevronRight, FiCamera, FiMic, FiZap } from 'react-icons/fi';
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
  highlights: string[];
}

const propertyTemplates = [
  {
    name: "Luxury Home",
    icon: "✨",
    fields: {
      title: "Stunning Luxury Estate",
      features: "Chef's kitchen, marble countertops, hardwood floors, spa bathroom, wine cellar",
      highlights: ["Luxury finishes", "Gourmet kitchen", "Master suite", "Premium location"]
    }
  },
  {
    name: "Family Starter",
    icon: "🏡",
    fields: {
      title: "Perfect Family Home",
      features: "Open floor plan, updated kitchen, large backyard, family room, storage",
      highlights: ["Family friendly", "Move-in ready", "Great schools", "Safe neighborhood"]
    }
  },
  {
    name: "Investment Property",
    icon: "📈",
    fields: {
      title: "Prime Investment Opportunity",
      features: "Rental history, low maintenance, good condition, parking included",
      highlights: ["Investment potential", "Rental income", "Appreciation potential", "Low maintenance"]
    }
  }
];

const highlightOptions = [
  { label: "Renovation potential", category: "investment" },
  { label: "Lot size", category: "property" },
  { label: "Neighbourhood", category: "location" },
  { label: "Outdoor space", category: "property" },
  { label: "Price point", category: "investment" },
  { label: "Parking", category: "features" },
  { label: "Quality of build", category: "property" },
  { label: "Nearby attractions", category: "location" },
  { label: "Environment", category: "location" },
  { label: "Basement", category: "features" },
  { label: "Rental income", category: "investment" }
];

export default function GenerateListing() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [aiEnhancing, setAiEnhancing] = useState(false);
  
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
    highlights: [],
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

  // Calculate completion percentage
  useEffect(() => {
    const requiredFields = ['title', 'address', 'price', 'bedrooms', 'bathrooms', 'squareFeet', 'yearBuilt', 'features'];
    const completed = requiredFields.filter(field => propertyDetails[field as keyof PropertyDetails]).length;
    setCompletionPercentage((completed / requiredFields.length) * 100);
  }, [propertyDetails]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPropertyDetails((prev) => ({ ...prev, [name]: value }));
  };

  const applyTemplate = (template: typeof propertyTemplates[0]) => {
    setPropertyDetails(prev => ({
      ...prev,
      title: template.fields.title,
      features: template.fields.features,
      highlights: template.fields.highlights
    }));
  };

  const toggleHighlight = (highlight: string) => {
    setPropertyDetails(prev => ({
      ...prev,
      highlights: prev.highlights.includes(highlight)
        ? prev.highlights.filter(h => h !== highlight)
        : [...prev.highlights, highlight]
    }));
  };

  const enhanceWithAI = async (field: string) => {
    setAiEnhancing(true);
    // Simulate AI enhancement
    setTimeout(() => {
      if (field === 'features') {
        setPropertyDetails(prev => ({
          ...prev,
          features: prev.features + (prev.features ? ', ' : '') + "premium finishes, energy efficient appliances"
        }));
      } else if (field === 'description') {
        setPropertyDetails(prev => ({
          ...prev,
          description: "This exceptional property offers the perfect blend of comfort and style, featuring thoughtfully designed spaces that flow seamlessly throughout."
        }));
      }
      setAiEnhancing(false);
    }, 1500);
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
      highlights: [],
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-6xl mx-auto">
        {/* Header with Progress */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Generate Listing
              </h1>
              <p className="text-slate-600 text-lg mt-2">Create compelling property listings with AI</p>
            </div>
            
            {step === 1 && (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-slate-500">
                  {Math.round(completionPercentage)}% complete
                </div>
                <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {step === 1 ? (
          <div className="space-y-8">
            {/* Quick Templates */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl shadow-slate-200/50">
              <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center">
                <FiStar className="mr-3 text-yellow-500" />
                Quick Start Templates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {propertyTemplates.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => applyTemplate(template)}
                    className="group relative p-6 text-left border-2 border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-white"
                  >
                    <div className="text-2xl mb-3">{template.icon}</div>
                    <h4 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {template.name}
                    </h4>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <FiChevronRight className="text-blue-500" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Property Details Form */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl shadow-slate-200/50 overflow-hidden">
              <div className="p-8">
                <h2 className="text-2xl font-semibold text-slate-800 mb-8 flex items-center">
                  <FiHome className="mr-3 text-blue-500" />
                  Property Details
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="relative group">
                      <label className="block text-sm font-medium text-slate-700 mb-3">
                        Listing Title
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="title"
                          value={propertyDetails.title}
                          onChange={handleChange}
                          className="w-full px-4 py-4 text-lg border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:ring-0 transition-all duration-300 placeholder-slate-400 hover:border-slate-300 bg-white/50"
                          placeholder="Stunning Modern Home"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => enhanceWithAI('title')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-500 transition-colors"
                        >
                                                     <FiZap className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="relative group">
                      <label className="block text-sm font-medium text-slate-700 mb-3 flex items-center">
                        <FiMapPin className="mr-2 text-slate-500" />
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={propertyDetails.address}
                        onChange={handleChange}
                        className="w-full px-4 py-4 text-lg border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:ring-0 transition-all duration-300 placeholder-slate-400 hover:border-slate-300 bg-white/50"
                        placeholder="123 Main St, City, State"
                        required
                      />
                    </div>
                  </div>

                  {/* Financial & Type */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="relative group">
                      <label className="block text-sm font-medium text-slate-700 mb-3 flex items-center">
                        <FiDollarSign className="mr-2 text-green-500" />
                        Price
                      </label>
                      <input
                        type="text"
                        name="price"
                        value={propertyDetails.price}
                        onChange={handleChange}
                        className="w-full px-4 py-4 text-lg border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:ring-0 transition-all duration-300 placeholder-slate-400 hover:border-slate-300 bg-white/50"
                        placeholder="$499,000"
                        required
                      />
                    </div>
                    
                    <div className="relative group">
                      <label className="block text-sm font-medium text-slate-700 mb-3">
                        Property Type
                      </label>
                      <select
                        name="propertyType"
                        value={propertyDetails.propertyType}
                        onChange={handleChange}
                        className="w-full px-4 py-4 text-lg border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:ring-0 transition-all duration-300 bg-white/50"
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

                    <div className="relative group">
                      <label className="block text-sm font-medium text-slate-700 mb-3 flex items-center">
                        <FiCalendar className="mr-2 text-slate-500" />
                        Year Built
                      </label>
                      <input
                        type="text"
                        name="yearBuilt"
                        value={propertyDetails.yearBuilt}
                        onChange={handleChange}
                        className="w-full px-4 py-4 text-lg border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:ring-0 transition-all duration-300 placeholder-slate-400 hover:border-slate-300 bg-white/50"
                        placeholder="2010"
                        required
                      />
                    </div>
                  </div>

                  {/* Property Specs */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-3">Bedrooms</label>
                      <input
                        type="text"
                        name="bedrooms"
                        value={propertyDetails.bedrooms}
                        onChange={handleChange}
                        className="w-full px-4 py-4 text-lg border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:ring-0 transition-all duration-300 placeholder-slate-400 hover:border-slate-300 bg-white/50"
                        placeholder="3"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-3">Bathrooms</label>
                      <input
                        type="text"
                        name="bathrooms"
                        value={propertyDetails.bathrooms}
                        onChange={handleChange}
                        className="w-full px-4 py-4 text-lg border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:ring-0 transition-all duration-300 placeholder-slate-400 hover:border-slate-300 bg-white/50"
                        placeholder="2"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-3">Square Feet</label>
                      <input
                        type="text"
                        name="squareFeet"
                        value={propertyDetails.squareFeet}
                        onChange={handleChange}
                        className="w-full px-4 py-4 text-lg border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:ring-0 transition-all duration-300 placeholder-slate-400 hover:border-slate-300 bg-white/50"
                        placeholder="2,000"
                        required
                      />
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-slate-700">Key Features</label>
                      <button
                        type="button"
                        onClick={() => enhanceWithAI('features')}
                        disabled={aiEnhancing}
                        className="inline-flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
                      >
                        {aiEnhancing ? (
                          <>
                            <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                            Enhancing...
                          </>
                        ) : (
                                                     <>
                             <FiZap className="mr-1.5 w-4 h-4" />
                             Enhance with AI
                           </>
                        )}
                      </button>
                    </div>
                    <textarea
                      name="features"
                      value={propertyDetails.features}
                      onChange={handleChange}
                      className="w-full px-4 py-4 text-lg border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:ring-0 transition-all duration-300 placeholder-slate-400 hover:border-slate-300 bg-white/50 h-24 resize-none"
                      placeholder="Hardwood floors, granite countertops, updated kitchen, etc."
                      required
                    />
                  </div>

                  {/* Highlights Toggle */}
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={() => setShowHighlights(!showHighlights)}
                      className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:from-blue-100 hover:to-purple-100 transition-all duration-300"
                    >
                      <span className="text-slate-800 font-medium">Areas to highlight</span>
                      <div className="flex items-center">
                        <span className="text-sm text-slate-600 mr-2">
                          {propertyDetails.highlights.length} selected
                        </span>
                        <FiChevronRight className={`transition-transform duration-300 ${showHighlights ? 'rotate-90' : ''}`} />
                      </div>
                    </button>

                    {showHighlights && (
                      <div className="p-6 bg-white rounded-xl border border-slate-200 space-y-6 animate-in slide-in-from-top-5 duration-300">
                        <p className="text-slate-600">The AI will pay special attention to these areas.</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {highlightOptions.map((option, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => toggleHighlight(option.label)}
                              className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                propertyDetails.highlights.includes(option.label)
                                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-200'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                          
                          <button
                            type="button"
                            className="p-3 rounded-lg border-2 border-dashed border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-600 transition-colors"
                          >
                            <FiPlus className="w-4 h-4 mx-auto mb-1" />
                            Add your own
                          </button>
                        </div>

                        {propertyDetails.highlights.length > 0 && (
                          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                            <h4 className="font-medium text-slate-800 mb-2">Selected highlights:</h4>
                            <div className="flex flex-wrap gap-2">
                              {propertyDetails.highlights.map((highlight, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full"
                                >
                                  {highlight}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Additional Description */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-slate-700">Additional Description</label>
                      <button
                        type="button"
                        onClick={() => enhanceWithAI('description')}
                        className="inline-flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                      >
                                                 <FiZap className="mr-1.5 w-4 h-4" />
                         Enhance with AI
                      </button>
                    </div>
                    <textarea
                      name="description"
                      value={propertyDetails.description}
                      onChange={handleChange}
                      className="w-full px-4 py-4 text-lg border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:ring-0 transition-all duration-300 placeholder-slate-400 hover:border-slate-300 bg-white/50 h-32 resize-none"
                      placeholder="Any additional details about the property..."
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-8 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-500">
                        {completionPercentage >= 100 ? (
                          <span className="text-green-600 font-medium">✓ Ready to generate</span>
                        ) : (
                          `${Math.round(completionPercentage)}% complete`
                        )}
                      </div>
                      
                      <button
                        type="submit"
                        disabled={loading || completionPercentage < 100}
                        className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg shadow-blue-200 disabled:shadow-none flex items-center"
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                            Generating Magic...
                          </>
                        ) : (
                          <>
                            <FiSend className="mr-3 group-hover:rotate-12 transition-transform duration-300" />
                            Generate Content
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : (
          /* Generated Content Display */
          <div className="space-y-8">
            {/* Success Header */}
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheck className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Content Generated Successfully!</h2>
              <p className="text-slate-600 text-lg">Your property listing is ready for all platforms</p>
            </div>

            {/* MLS Description */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl shadow-slate-200/50">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-slate-800 flex items-center">
                  <FiEdit3 className="mr-3 text-blue-500" />
                  MLS Description
                </h3>
                <button
                  onClick={() => handleCopy('mls')}
                  className="group flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                >
                  {copied.mls ? (
                    <>
                      <FiCheck className="mr-2 w-4 h-4" /> Copied!
                    </>
                  ) : (
                    <>
                      <FiCopy className="mr-2 w-4 h-4 group-hover:scale-110 transition-transform" /> Copy
                    </>
                  )}
                </button>
              </div>
              <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 p-6 rounded-xl whitespace-pre-wrap text-slate-700 leading-relaxed">
                {generatedContent.mls}
              </div>
            </div>
            
            {/* Social Media Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Facebook */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl shadow-slate-200/50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">Facebook</h3>
                  <button
                    onClick={() => handleCopy('facebook')}
                    className="group flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    {copied.facebook ? (
                      <FiCheck className="w-4 h-4" />
                    ) : (
                      <FiCopy className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    )}
                  </button>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg mb-4 h-48 overflow-y-auto text-sm text-slate-700">
                  {generatedContent.facebook}
                </div>
                {/* Facebook Preview */}
                <div className="border border-slate-200 rounded-lg p-4 bg-white">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3 text-sm font-bold">
                      RE
                    </div>
                    <div>
                      <p className="font-medium text-sm text-slate-800">Real Estate Pro</p>
                      <p className="text-xs text-slate-500">Just now</p>
                    </div>
                  </div>
                  <p className="text-sm mb-3 text-slate-700 line-clamp-2">{generatedContent.facebook.substring(0, 100)}...</p>
                  <div className="aspect-video bg-gradient-to-br from-slate-100 to-blue-100 rounded-lg flex items-center justify-center">
                    <FiCamera className="text-slate-400 w-8 h-8" />
                  </div>
                </div>
              </div>
              
              {/* Instagram */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl shadow-slate-200/50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">Instagram</h3>
                  <button
                    onClick={() => handleCopy('instagram')}
                    className="group flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    {copied.instagram ? (
                      <FiCheck className="w-4 h-4" />
                    ) : (
                      <FiCopy className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    )}
                  </button>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg mb-4 h-48 overflow-y-auto text-sm text-slate-700">
                  {generatedContent.instagram}
                </div>
                {/* Instagram Preview */}
                <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
                  <div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                    <FiCamera className="text-slate-400 w-12 h-12" />
                  </div>
                  <div className="p-3">
                    <div className="flex items-center mb-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center text-white mr-2 text-xs font-bold">
                        RE
                      </div>
                      <p className="font-medium text-sm text-slate-800">realestatepro</p>
                    </div>
                    <p className="text-sm text-slate-700 line-clamp-2">{generatedContent.instagram.substring(0, 80)}...</p>
                  </div>
                </div>
              </div>
              
              {/* LinkedIn */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl shadow-slate-200/50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">LinkedIn</h3>
                  <button
                    onClick={() => handleCopy('linkedin')}
                    className="group flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    {copied.linkedin ? (
                      <FiCheck className="w-4 h-4" />
                    ) : (
                      <FiCopy className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    )}
                  </button>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg mb-4 h-48 overflow-y-auto text-sm text-slate-700">
                  {generatedContent.linkedin}
                </div>
                {/* LinkedIn Preview */}
                <div className="border border-slate-200 rounded-lg p-4 bg-white">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white mr-3 text-sm font-bold">
                      RE
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Real Estate Professional</p>
                      <p className="text-xs text-slate-500">Real Estate Agent • Just now</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 line-clamp-3">{generatedContent.linkedin.substring(0, 120)}...</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <button
                onClick={handleCreateNew}
                className="px-8 py-4 bg-white border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:border-slate-400 hover:bg-slate-50 transition-all duration-300 flex items-center justify-center"
              >
                <FiPlus className="mr-2" />
                Create New Listing
              </button>
              
              <button
                onClick={() => router.push('/dashboard')}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-200 flex items-center justify-center"
              >
                <FiHome className="mr-2" />
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
