'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiSend, FiCopy, FiCheck, FiEdit3, FiHome, FiDollarSign, FiMapPin, FiCalendar, FiTrendingUp, FiStar, FiPlus, FiChevronRight, FiCamera, FiMic, FiZap, FiArrowLeft, FiFileText, FiTarget, FiLayers, FiGlobe } from 'react-icons/fi';
import { supabase } from '../../../lib/supabase';
import { LoadingScreen, LISTING_GENERATION_STEPS } from '@/components/ui/loading-screen';

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
  const [saveLoading, setSaveLoading] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  
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

  const simulateResearchProgress = async () => {
    // Step 1: Property Research
    setLoadingStep(0);
    setLoadingProgress(15);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setLoadingProgress(45);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoadingProgress(100);
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const simulateGenerationProgress = async () => {
    // Step 1: Property Research (already done)
    setLoadingStep(0);
    setLoadingProgress(100);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Step 2: Market Analysis
    setLoadingStep(1);
    setLoadingProgress(20);
    await new Promise(resolve => setTimeout(resolve, 2500));
    setLoadingProgress(60);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 3: Content Generation
    setLoadingStep(2);
    setLoadingProgress(75);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoadingProgress(95);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoadingProgress(100);
    await new Promise(resolve => setTimeout(resolve, 500));
  };

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
      // Start progress simulation
      const progressPromise = simulateResearchProgress();
      
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
      
      // Wait for progress simulation to complete
      await progressPromise;
      
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
      setLoadingStep(0);
      setLoadingProgress(0);
    }
  };

  // Handle Step 2 -> Step 3: Generate listings
  const handleGenerateListings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Start progress simulation
      const progressPromise = simulateGenerationProgress();
      
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
      
      // Wait for progress simulation to complete
      await progressPromise;
      
      setGeneratedContent(generatedData);
      setStep(3);
    } catch (error) {
      console.error('Error generating listings:', error);
      alert('Failed to generate listing content. Please try again.');
    } finally {
      setLoading(false);
      setLoadingStep(0);
      setLoadingProgress(0);
    }
  };

  const handleCopy = (type: keyof typeof copied) => {
    const content = generatedContent[type];
    navigator.clipboard.writeText(content);
    setCopied({ ...copied, [type]: true });
    setTimeout(() => setCopied({ ...copied, [type]: false }), 2000);
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
    setGeneratedContent({ mls: '', facebook: '', instagram: '', linkedin: '' });
  };

  // Save generated listing to database
  const handleSaveListing = async () => {
    setSaveLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Please log in to save listings');
      }

      // Prepare listing data for database
      const listingData = {
        user_id: session.user.id,
        title: propertyDetails.title,
        property_details: {
          address: propertyDetails.address,
          price: parseFloat(propertyDetails.price.replace(/[^0-9.]/g, '')) || 0,
          bedrooms: parseInt(propertyDetails.bedrooms) || 0,
          bathrooms: parseFloat(propertyDetails.bathrooms) || 0,
          sqft: parseInt(propertyDetails.squareFeet.replace(/[^0-9]/g, '')) || 0,
          yearBuilt: parseInt(propertyDetails.yearBuilt) || 0,
          propertyType: propertyDetails.propertyType,
          features: propertyDetails.features,
          highlights: propertyDetails.highlights,
        },
        mls_description: generatedContent.mls,
        facebook_content: generatedContent.facebook,
        instagram_content: generatedContent.instagram,
        linkedin_content: generatedContent.linkedin,
      };

      const { data, error } = await supabase
        .from('listings')
        .insert([listingData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Navigate to the saved listing
      router.push(`/dashboard/listings/${data.id}`);
    } catch (error) {
      console.error('Error saving listing:', error);
      alert('Failed to save listing. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-8">
        {/* Premium Header with Progress */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-sm border border-white/10 rounded-xl">
              <FiFileText className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-tight">
                Generate Listing
              </h1>
              <p className="text-lg text-gray-400 mt-1">
                Step {step} of 3: {step === 1 ? 'Enter the property address' : 
                                  step === 2 ? 'Customize property details' : 
                                  'Review generated content'}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/10 rounded-full h-2 backdrop-blur-sm">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Loading Screen Overlay */}
        {researchLoading && (
          <LoadingScreen
            title="Researching Property"
            subtitle="Gathering market data and property information for accurate listing generation"
            steps={LISTING_GENERATION_STEPS}
            currentStep={loadingStep}
            progress={loadingProgress}
            disclaimer="Our AI pre-fills property information based on available data sources. Please review and verify all details before generating your listing."
          />
        )}

        {loading && (
          <LoadingScreen
            title="Generating Listings"
            subtitle="Creating personalized marketing content optimized for different platforms"
            steps={LISTING_GENERATION_STEPS}
            currentStep={loadingStep}
            progress={loadingProgress}
            disclaimer="Generated content is AI-created and should be reviewed for accuracy. Customize any details to match your specific property and marketing preferences."
          />
        )}

        {/* Step 1: Address Input */}
        {step === 1 && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-10 shadow-2xl">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <FiMapPin className="h-6 w-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">Property Address</h2>
              </div>
              <p className="text-gray-400">We'll research the property details for you</p>
            </div>

            <form onSubmit={handleResearchProperty} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Street Address *</label>
                <input
                  type="text"
                  name="address"
                  value={addressInfo.address}
                  onChange={handleAddressChange}
                  placeholder="123 Main Street"
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={addressInfo.city}
                    onChange={handleAddressChange}
                    placeholder="San Francisco"
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={addressInfo.state}
                    onChange={handleAddressChange}
                    placeholder="CA"
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Zip Code (Optional)</label>
                <input
                  type="text"
                  name="zipCode"
                  value={addressInfo.zipCode}
                  onChange={handleAddressChange}
                  placeholder="94102"
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                />
              </div>

              <button
                type="submit"
                disabled={researchLoading || !addressInfo.address || !addressInfo.city || !addressInfo.state}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 flex items-center justify-center gap-3 text-lg shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/10"
              >
                {researchLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Researching Property...
                  </>
                ) : (
                  <>
                    <FiZap className="h-5 w-5" />
                    Research Property & Continue
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Property Details */}
        {step === 2 && (
          <div className="space-y-8">
            {/* Completion Status */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Property Details</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Completion:</span>
                  <span className="text-white font-medium">{Math.round(completionPercentage)}%</span>
                </div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Property Details Form */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 shadow-2xl">
              <form onSubmit={handleGenerateListings} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Listing Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={propertyDetails.title}
                      onChange={handlePropertyChange}
                      placeholder="Beautiful family home..."
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Property Type</label>
                    <select
                      name="propertyType"
                      value={propertyDetails.propertyType}
                      onChange={handlePropertyChange}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    >
                      <option value="Single Family">Single Family</option>
                      <option value="Condo">Condo</option>
                      <option value="Townhouse">Townhouse</option>
                      <option value="Multi-Family">Multi-Family</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Full Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={propertyDetails.address}
                    onChange={handlePropertyChange}
                    placeholder="Complete property address"
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>

                {/* Property Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Price *</label>
                    <input
                      type="text"
                      name="price"
                      value={propertyDetails.price}
                      onChange={handlePropertyChange}
                      placeholder="$500,000"
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Bedrooms *</label>
                    <input
                      type="text"
                      name="bedrooms"
                      value={propertyDetails.bedrooms}
                      onChange={handlePropertyChange}
                      placeholder="3"
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Bathrooms *</label>
                    <input
                      type="text"
                      name="bathrooms"
                      value={propertyDetails.bathrooms}
                      onChange={handlePropertyChange}
                      placeholder="2"
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Square Feet *</label>
                    <input
                      type="text"
                      name="squareFeet"
                      value={propertyDetails.squareFeet}
                      onChange={handlePropertyChange}
                      placeholder="1,500"
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Year Built *</label>
                  <input
                    type="text"
                    name="yearBuilt"
                    value={propertyDetails.yearBuilt}
                    onChange={handlePropertyChange}
                    placeholder="2010"
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Key Features *</label>
                  <textarea
                    name="features"
                    value={propertyDetails.features}
                    onChange={handlePropertyChange}
                    placeholder="Updated kitchen, hardwood floors, two-car garage..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>

                {/* Highlights Selection */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-white">Marketing Highlights</label>
                    <button
                      type="button"
                      onClick={() => setShowHighlights(!showHighlights)}
                      className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                    >
                      {showHighlights ? 'Hide' : 'Show'} Options
                      <FiChevronRight className={`h-4 w-4 transition-transform ${showHighlights ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                  
                  {showHighlights && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {highlightOptions.map((option) => (
                        <button
                          key={option.label}
                          type="button"
                          onClick={() => toggleHighlight(option.label)}
                          className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                            propertyDetails.highlights.includes(option.label)
                              ? 'bg-blue-500/20 border border-blue-400/50 text-blue-300'
                              : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {propertyDetails.highlights.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-400 mb-3">Selected Marketing Highlights:</p>
                      <div className="flex flex-wrap gap-3">
                        {propertyDetails.highlights.map((highlight) => (
                          <div
                            key={highlight}
                            className="flex items-center gap-2 px-4 py-3 bg-blue-500/20 border border-blue-400/50 text-blue-200 rounded-lg text-sm font-medium group hover:bg-blue-500/30 transition-all duration-200"
                          >
                            <span>{highlight}</span>
                            <button
                              type="button"
                              onClick={() => toggleHighlight(highlight)}
                              className="w-6 h-6 rounded-full bg-red-500/20 hover:bg-red-500/40 border border-red-400/30 hover:border-red-400/60 flex items-center justify-center text-red-300 hover:text-red-200 transition-all duration-200 group-hover:scale-110 ml-2"
                              title={`Remove "${highlight}"`}
                            >
                              <span className="text-sm font-bold">×</span>
                            </button>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Click the × to remove any highlights you don't want to emphasize
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center gap-2"
                  >
                    <FiArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || completionPercentage < 100}
                    className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating Listings...
                      </>
                    ) : (
                      <>
                        <FiZap className="h-5 w-5" />
                        Generate Listings
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Step 3: Generated Content */}
        {step === 3 && (
          <div className="space-y-8">
            {/* Success Header */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg">
                  <FiCheck className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Listings Generated Successfully!</h2>
                  <p className="text-gray-400">Your property listings are ready for different platforms</p>
                </div>
              </div>
            </div>

            {/* Generated Content Cards */}
            <div className="grid gap-6">
              {/* MLS Listing */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <FiHome className="h-5 w-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">MLS Listing</h3>
                  </div>
                  <button
                    onClick={() => handleCopy('mls')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2"
                  >
                    {copied.mls ? <FiCheck className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
                    {copied.mls ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-gray-300 whitespace-pre-wrap">{generatedContent.mls}</p>
                </div>
              </div>

              {/* Social Media Posts */}
              {['facebook', 'instagram', 'linkedin'].map((platform) => (
                <div key={platform} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <FiGlobe className="h-5 w-5 text-purple-400" />
                      <h3 className="text-lg font-semibold text-white capitalize">{platform} Post</h3>
                    </div>
                    <button
                      onClick={() => handleCopy(platform as keyof typeof copied)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2"
                    >
                      {copied[platform as keyof typeof copied] ? <FiCheck className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
                      {copied[platform as keyof typeof copied] ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-300 whitespace-pre-wrap">{generatedContent[platform as keyof typeof generatedContent]}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 pt-8">
              <button
                onClick={handleSaveListing}
                disabled={saveLoading}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 flex items-center gap-3 shadow-lg hover:shadow-xl"
              >
                {saveLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving Listing...
                  </>
                ) : (
                  <>
                    <FiCheck className="h-5 w-5" />
                    Save Listing
                  </>
                )}
              </button>
              <button
                onClick={handleCreateNew}
                className="bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 border border-white/10 backdrop-blur-sm"
              >
                Create New Listing
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
