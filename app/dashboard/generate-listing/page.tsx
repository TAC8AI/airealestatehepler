'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiSend, FiCopy, FiCheck, FiEdit3, FiHome, FiDollarSign, FiMapPin, FiCalendar, FiTrendingUp, FiStar, FiPlus, FiChevronRight, FiCamera, FiMic, FiZap, FiArrowLeft, FiFileText } from 'react-icons/fi';
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
      <div className="min-h-screen bg-gradient-to-tr from-primary-50 via-white to-secondary-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary-800 mb-2">Generate Listing</h1>
            <p className="text-secondary-600">Step 1 of 3: Enter the property address</p>
          </div>
          
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary-100 p-3 rounded-full">
                <FiMapPin className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-primary-800">Property Address</h2>
                <p className="text-secondary-600 text-sm">We'll research the property details for you</p>
              </div>
            </div>
            
            <form onSubmit={handleResearchProperty} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={addressInfo.address}
                  onChange={handleAddressChange}
                  className="input"
                  placeholder="123 Main Street"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={addressInfo.city}
                    onChange={handleAddressChange}
                    className="input"
                    placeholder="San Francisco"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={addressInfo.state}
                    onChange={handleAddressChange}
                    className="input"
                    placeholder="CA"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zip Code (Optional)
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={addressInfo.zipCode}
                  onChange={handleAddressChange}
                  className="input"
                  placeholder="94102"
                />
              </div>
              
              <button
                type="submit"
                disabled={researchLoading}
                className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-3"
              >
                {researchLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Researching Property...
                  </>
                ) : (
                  <>
                    <FiZap />
                    Research Property & Continue
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
      <div className="min-h-screen bg-gradient-to-tr from-primary-50 via-white to-secondary-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4"
            >
              <FiArrowLeft /> Back to Address
            </button>
            <h1 className="text-3xl font-bold text-primary-800 mb-2">Property Details</h1>
            <p className="text-secondary-600">Step 2 of 3: Review and edit the property information</p>
            
            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-secondary-600 mb-2">
                <span>Completion</span>
                <span>{Math.round(completionPercentage)}%</span>
              </div>
              <div className="w-full bg-secondary-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          <form onSubmit={handleGenerateListings} className="space-y-8">
            {/* Basic Information */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FiHome className="text-primary-600" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Listing Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={propertyDetails.title}
                    onChange={handlePropertyChange}
                    className="input"
                    placeholder="Beautiful Family Home"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={propertyDetails.address}
                    onChange={handlePropertyChange}
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <input
                    type="text"
                    name="price"
                    value={propertyDetails.price}
                    onChange={handlePropertyChange}
                    className="input"
                    placeholder="$750,000"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type *
                  </label>
                  <select
                    name="propertyType"
                    value={propertyDetails.propertyType}
                    onChange={handlePropertyChange}
                    className="input"
                    required
                  >
                    <option value="Single Family">Single Family</option>
                    <option value="Townhouse">Townhouse</option>
                    <option value="Condo">Condo</option>
                    <option value="Multi-Family">Multi-Family</option>
                    <option value="Land">Land</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FiEdit3 className="text-primary-600" />
                Property Specifications
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrooms *
                  </label>
                  <input
                    type="text"
                    name="bedrooms"
                    value={propertyDetails.bedrooms}
                    onChange={handlePropertyChange}
                    className="input"
                    placeholder="3"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bathrooms *
                  </label>
                  <input
                    type="text"
                    name="bathrooms"
                    value={propertyDetails.bathrooms}
                    onChange={handlePropertyChange}
                    className="input"
                    placeholder="2.5"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Square Feet *
                  </label>
                  <input
                    type="text"
                    name="squareFeet"
                    value={propertyDetails.squareFeet}
                    onChange={handlePropertyChange}
                    className="input"
                    placeholder="2,100"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year Built *
                  </label>
                  <input
                    type="text"
                    name="yearBuilt"
                    value={propertyDetails.yearBuilt}
                    onChange={handlePropertyChange}
                    className="input"
                    placeholder="1995"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Features and Description */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FiStar className="text-primary-600" />
                Features & Description
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Features *
                  </label>
                  <textarea
                    name="features"
                    value={propertyDetails.features}
                    onChange={handlePropertyChange}
                    className="input h-24"
                    placeholder="Updated kitchen, hardwood floors, two-car garage..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Market Analysis
                  </label>
                  <textarea
                    name="description"
                    value={propertyDetails.description}
                    onChange={handlePropertyChange}
                    className="input h-32"
                    placeholder="Market insights and property description..."
                  />
                </div>
              </div>
            </div>

            {/* Highlights */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FiTrendingUp className="text-primary-600" />
                Marketing Highlights
              </h3>
              
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setShowHighlights(!showHighlights)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <FiPlus />
                  {showHighlights ? 'Hide' : 'Add'} Highlights
                </button>
              </div>
              
              {showHighlights && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                  {highlightOptions.map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => toggleHighlight(option.label)}
                      className={`p-2 text-sm rounded-md border transition-colors ${
                        propertyDetails.highlights.includes(option.label)
                          ? 'bg-primary-100 border-primary-300 text-primary-800'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
              
              {propertyDetails.highlights.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Selected Highlights:</p>
                  <div className="flex flex-wrap gap-2">
                    {propertyDetails.highlights.map((highlight) => (
                      <span
                        key={highlight}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                      >
                        {highlight}
                        <button
                          type="button"
                          onClick={() => toggleHighlight(highlight)}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-secondary flex items-center gap-2"
              >
                <FiArrowLeft />
                Back
              </button>
              
              <button
                type="submit"
                disabled={loading || completionPercentage < 100}
                className="btn-primary flex-1 flex items-center justify-center gap-2 text-lg py-3"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating Content...
                  </>
                ) : (
                  <>
                    <FiChevronRight />
                    Generate Listing Content
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
    <div className="min-h-screen bg-gradient-to-tr from-primary-50 via-white to-secondary-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => setStep(2)}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4"
          >
            <FiArrowLeft /> Back to Edit Details
          </button>
          <h1 className="text-3xl font-bold text-primary-800 mb-2">Generated Content</h1>
          <p className="text-secondary-600">Step 3 of 3: Your listing content is ready!</p>
        </div>

        <div className="space-y-6">
          {/* MLS Description */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FiFileText className="text-primary-600" />
                MLS Description
              </h3>
              <button
                onClick={() => handleCopy('mls')}
                className="btn-secondary flex items-center gap-2"
              >
                {copied.mls ? <FiCheck className="text-green-600" /> : <FiCopy />}
                {copied.mls ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="whitespace-pre-wrap">{generatedContent.mls}</p>
            </div>
          </div>

          {/* Social Media Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Facebook */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-blue-600">Facebook</h3>
                <button
                  onClick={() => handleCopy('facebook')}
                  className="btn-secondary flex items-center gap-2 text-sm py-1 px-2"
                >
                  {copied.facebook ? <FiCheck className="text-green-600" /> : <FiCopy />}
                  {copied.facebook ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{generatedContent.facebook}</p>
              </div>
            </div>

            {/* Instagram */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-pink-600">Instagram</h3>
                <button
                  onClick={() => handleCopy('instagram')}
                  className="btn-secondary flex items-center gap-2 text-sm py-1 px-2"
                >
                  {copied.instagram ? <FiCheck className="text-green-600" /> : <FiCopy />}
                  {copied.instagram ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{generatedContent.instagram}</p>
              </div>
            </div>

            {/* LinkedIn */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-blue-700">LinkedIn</h3>
                <button
                  onClick={() => handleCopy('linkedin')}
                  className="btn-secondary flex items-center gap-2 text-sm py-1 px-2"
                >
                  {copied.linkedin ? <FiCheck className="text-green-600" /> : <FiCopy />}
                  {copied.linkedin ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{generatedContent.linkedin}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              onClick={handleCreateNew}
              className="btn-primary flex items-center gap-2"
            >
              <FiPlus />
              Create New Listing
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="btn-secondary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
