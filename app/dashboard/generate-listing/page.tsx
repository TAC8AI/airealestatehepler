'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiSend, FiCopy, FiCheck, FiEdit3, FiHome, FiDollarSign, FiMapPin, FiCalendar, FiTrendingUp, FiStar, FiPlus, FiChevronRight, FiCamera, FiMic, FiZap, FiArrowLeft, FiFileText, FiTarget, FiLayers, FiGlobe } from 'react-icons/fi';
import { supabase } from '../../../lib/supabase';

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

interface AddressInfo {
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

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
  const [researchLoading, setResearchLoading] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  
  // Step 1: Basic address info
  const [addressInfo, setAddressInfo] = useState<AddressInfo>({
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });
  
  // Step 2: Detailed property info (pre-filled by AI, editable by user)
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
  
  // Step 3: Generated content
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

  // Calculate completion percentage for step 2
  useEffect(() => {
    const requiredFields = ['title', 'address', 'price', 'bedrooms', 'bathrooms', 'squareFeet', 'yearBuilt', 'features'];
    const completed = requiredFields.filter(field => propertyDetails[field as keyof PropertyDetails]).length;
    setCompletionPercentage((completed / requiredFields.length) * 100);
  }, [propertyDetails]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddressInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handlePropertyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPropertyDetails((prev) => ({ ...prev, [name]: value }));
  };

  const toggleHighlight = (highlight: string) => {
    setPropertyDetails(prev => ({
      ...prev,
      highlights: prev.highlights.includes(highlight)
        ? prev.highlights.filter(h => h !== highlight)
        : [...prev.highlights, highlight]
    }));
  };

  // Handle Step 1 -> Step 2: Research property
  const handleResearchProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setResearchLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Please log in to research properties');
      }

      // Call the property research Edge Function
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/Listing-Description-Part-1`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressInfo),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to research property');
      }

      const researchData = await response.json();
      
      // Pre-fill property details with research data
      setPropertyDetails(prev => ({
        ...prev,
        title: `${researchData.propertyType || 'Property'} at ${addressInfo.address}`,
        address: `${addressInfo.address}, ${addressInfo.city}, ${addressInfo.state}`,
        price: researchData.estimatedPrice || '',
        bedrooms: researchData.bedrooms || '',
        bathrooms: researchData.bathrooms || '',
        squareFeet: researchData.squareFeet || '',
        yearBuilt: researchData.yearBuilt || '',
        propertyType: researchData.propertyType || 'Single Family',
        features: researchData.keyFeatures || '',
        description: researchData.marketAnalysis || '',
        highlights: [
          ...(researchData.neighborhoodHighlights || []),
          ...(researchData.areasToHighlight || [])
        ],
      }));
      
      setStep(2);
    } catch (error) {
      console.error('Error researching property:', error);
      alert('Failed to research property. Please try again.');
    } finally {
      setResearchLoading(false);
    }
  };

  // Handle Step 2 -> Step 3: Generate listings
  const handleGenerateListings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Please log in to generate listings');
      }

      // Call the listing generation Edge Function
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/Listing-Description-Part-2`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyDetails: propertyDetails,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate listing content');
      }

      const generatedData = await response.json();
      
      setGeneratedContent({
        mls: generatedData.mls,
        facebook: generatedData.facebook,
        instagram: generatedData.instagram,
        linkedin: generatedData.linkedin,
      });
      
      setStep(3);
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (type: keyof typeof copied) => {
    const content = generatedContent[type];
    navigator.clipboard.writeText(content);
    setCopied((prev) => ({ ...prev, [type]: true }));
    setTimeout(() => {
      setCopied((prev) => ({ ...prev, [type]: false }));
    }, 2000);
  };

  const handleCreateNew = () => {
    setStep(1);
    setAddressInfo({ address: '', city: '', state: '', zipCode: '' });
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
  };

  // STEP 1: Address Input
  if (step === 1) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-semibold text-gray-900 mb-4">Generate Listing</h1>
            <p className="text-lg text-gray-600">Step 1 of 3: Enter the property address</p>
          </div>
          
          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Card Header */}
            <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <FiMapPin className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Property Address</h2>
                  <p className="text-sm text-gray-500 mt-1">We'll research the property details for you</p>
                </div>
              </div>
            </div>
            
            {/* Form */}
            <form onSubmit={handleResearchProperty} className="p-8 space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={addressInfo.address}
                  onChange={handleAddressChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="123 Main Street"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={addressInfo.city}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                    placeholder="San Francisco"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={addressInfo.state}
                    onChange={handleAddressChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                    placeholder="CA"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Zip Code (Optional)
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={addressInfo.zipCode}
                  onChange={handleAddressChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                  placeholder="94102"
                />
              </div>
              
              <button
                type="submit"
                disabled={researchLoading}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {researchLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-lg">Researching Property</span>
                  </>
                ) : (
                  <>
                    <FiZap className="w-5 h-5" />
                    <span className="text-lg">Research Property & Continue</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: Property Details (Pre-filled, Editable)
  if (step === 2) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-8 py-12">
          {/* Header */}
          <div className="mb-12">
            <button
              onClick={() => setStep(1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span>Back to Address</span>
            </button>
            
            <div className="text-center">
              <h1 className="text-4xl font-semibold text-gray-900 mb-4">Property Details</h1>
              <p className="text-lg text-gray-600 mb-8">Step 2 of 3: Review and edit the property information</p>
              
              {/* Enhanced Progress bar */}
              <div className="max-w-md mx-auto">
                <div className="flex justify-between text-sm font-medium text-gray-600 mb-3">
                  <span>Completion</span>
                  <span className="text-gray-900">{Math.round(completionPercentage)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-gray-800 to-gray-900 h-3 rounded-full transition-all duration-700 ease-out shadow-sm"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {completionPercentage === 100 ? 'Ready to generate!' : 'Fill all required fields to continue'}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleGenerateListings} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <FiHome className="w-5 h-5 text-gray-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                </div>
              </div>
              
              <div className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Listing Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={propertyDetails.title}
                    onChange={handlePropertyChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                    placeholder="Beautiful Family Home"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Full Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={propertyDetails.address}
                    onChange={handlePropertyChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Price *
                    </label>
                    <input
                      type="text"
                      name="price"
                      value={propertyDetails.price}
                      onChange={handlePropertyChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                      placeholder="$750,000"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Property Type *
                    </label>
                    <div className="relative">
                      <select
                        name="propertyType"
                        value={propertyDetails.propertyType}
                        onChange={handlePropertyChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white appearance-none cursor-pointer shadow-sm"
                        required
                      >
                        <option value="Single Family">Single Family</option>
                        <option value="Townhouse">Townhouse</option>
                        <option value="Condo">Condo</option>
                        <option value="Multi-Family">Multi-Family</option>
                        <option value="Land">Land</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Property Specifications */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <FiTarget className="w-5 h-5 text-gray-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Property Specifications</h3>
                </div>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Bedrooms *
                    </label>
                    <input
                      type="text"
                      name="bedrooms"
                      value={propertyDetails.bedrooms}
                      onChange={handlePropertyChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                      placeholder="3"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Bathrooms *
                    </label>
                    <input
                      type="text"
                      name="bathrooms"
                      value={propertyDetails.bathrooms}
                      onChange={handlePropertyChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                      placeholder="2.5"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Square Feet *
                    </label>
                    <input
                      type="text"
                      name="squareFeet"
                      value={propertyDetails.squareFeet}
                      onChange={handlePropertyChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                      placeholder="2,100"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Year Built *
                    </label>
                    <input
                      type="text"
                      name="yearBuilt"
                      value={propertyDetails.yearBuilt}
                      onChange={handlePropertyChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                      placeholder="1995"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Features & Description */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <FiStar className="w-5 h-5 text-gray-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Features & Description</h3>
                </div>
              </div>
              
              <div className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Key Features *
                  </label>
                  <textarea
                    name="features"
                    value={propertyDetails.features}
                    onChange={handlePropertyChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 resize-none shadow-sm"
                    rows={6}
                    placeholder="Updated kitchen, hardwood floors, two-car garage..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Market Analysis
                  </label>
                  <textarea
                    name="description"
                    value={propertyDetails.description}
                    onChange={handlePropertyChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 resize-none shadow-sm"
                    rows={8}
                    placeholder="Market insights and property description..."
                  />
                </div>
              </div>
            </div>

            {/* Marketing Highlights */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <FiTrendingUp className="w-5 h-5 text-gray-700" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Marketing Highlights</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowHighlights(!showHighlights)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <FiPlus className="w-4 h-4" />
                    <span>{showHighlights ? 'Hide' : 'Add'} Highlights</span>
                  </button>
                </div>
              </div>
              
              <div className="p-8">
                {showHighlights && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                    {highlightOptions.map((option) => (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => toggleHighlight(option.label)}
                        className={`p-3 text-sm font-medium rounded-lg border transition-all duration-200 ${
                          propertyDetails.highlights.includes(option.label)
                            ? 'bg-gray-900 border-gray-900 text-white'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
                
                {propertyDetails.highlights.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-4">Selected Highlights:</p>
                    <div className="flex flex-wrap gap-2">
                      {propertyDetails.highlights.map((highlight) => (
                        <span
                          key={highlight}
                          className="inline-flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium"
                        >
                          <span>{highlight}</span>
                          <button
                            type="button"
                            onClick={() => toggleHighlight(highlight)}
                            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Professional Disclaimer */}
            <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">AI-Generated Content Notice</h4>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    This content is AI-generated for reference only. Please verify all property details, market data, and pricing information before use. 
                    Add your professional expertise and local market knowledge to ensure accuracy and compliance with your local MLS requirements.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2"
              >
                <FiArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              
              <button
                type="submit"
                disabled={loading || completionPercentage < 100}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-medium py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-lg">Generating Content</span>
                  </>
                ) : (
                  <>
                    <FiChevronRight className="w-5 h-5" />
                    <span className="text-lg">Generate Listing Content</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // STEP 3: Generated Content
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => setStep(2)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Back to Edit Details</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl font-semibold text-gray-900 mb-4">Generated Content</h1>
            <p className="text-lg text-gray-600">Step 3 of 3: Your listing content is ready!</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* MLS Description */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    <FiFileText className="w-5 h-5 text-gray-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">MLS Description</h3>
                </div>
                <button
                  onClick={() => handleCopy('mls')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2"
                >
                  {copied.mls ? <FiCheck className="w-4 h-4 text-green-600" /> : <FiCopy className="w-4 h-4" />}
                  <span>{copied.mls ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>
            <div className="p-8">
              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{generatedContent.mls}</p>
              </div>
            </div>
          </div>

          {/* Social Media Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Facebook */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FiGlobe className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-blue-600">Facebook</h3>
                  </div>
                  <button
                    onClick={() => handleCopy('facebook')}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    {copied.facebook ? <FiCheck className="w-4 h-4 text-green-600" /> : <FiCopy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">{generatedContent.facebook}</p>
                </div>
              </div>
            </div>

            {/* Instagram */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                      <FiCamera className="w-4 h-4 text-pink-600" />
                    </div>
                    <h3 className="font-semibold text-pink-600">Instagram</h3>
                  </div>
                  <button
                    onClick={() => handleCopy('instagram')}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    {copied.instagram ? <FiCheck className="w-4 h-4 text-green-600" /> : <FiCopy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">{generatedContent.instagram}</p>
                </div>
              </div>
            </div>

            {/* LinkedIn */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FiLayers className="w-4 h-4 text-blue-700" />
                    </div>
                    <h3 className="font-semibold text-blue-700">LinkedIn</h3>
                  </div>
                  <button
                    onClick={() => handleCopy('linkedin')}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    {copied.linkedin ? <FiCheck className="w-4 h-4 text-green-600" /> : <FiCopy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">{generatedContent.linkedin}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 pt-8">
            <button
              onClick={handleCreateNew}
              className="px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-all duration-300 flex items-center space-x-3 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <FiPlus className="w-5 h-5" />
              <span>Create New Listing</span>
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-8 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
