'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';
import { FiArrowLeft, FiCopy, FiCheck } from 'react-icons/fi';

export default function ContractDetail({ params }: { params: { id: string } }) {
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/login');
          return;
        }
        
        // Fetch contract details
        const { data, error } = await supabase
          .from('contracts')
          .select('*')
          .eq('id', params.id)
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching contract:', error);
          setLoading(false);
          return;
        }
        
        if (!data) {
          console.error('Contract not found or access denied');
          router.push('/dashboard');
          return;
        }
        
        setContract(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContract();
  }, [params.id, router]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Contract not found</h2>
        <p className="text-secondary-600 mb-6">The contract you're looking for doesn't exist or you don't have permission to view it.</p>
        <button 
          onClick={() => router.push('/dashboard')}
          className="btn btn-primary"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div>
      <button 
        onClick={() => router.push('/dashboard')}
        className="flex items-center text-secondary-600 hover:text-secondary-900 mb-6"
      >
        <FiArrowLeft className="mr-2" /> Back to Dashboard
      </button>
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary-900">{contract.title}</h1>
        <p className="text-secondary-600">Analyzed on {formatDate(contract.created_at)}</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Summary</h2>
            <button 
              onClick={() => copyToClipboard(contract.summary)}
              className="btn btn-sm btn-outline flex items-center"
            >
              {copied ? <FiCheck className="mr-1" /> : <FiCopy className="mr-1" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="bg-secondary-50 p-4 rounded-lg">
            <pre className="whitespace-pre-wrap font-sans text-secondary-800">
              {contract.summary}
            </pre>
          </div>
        </div>
        
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Original Contract</h2>
            <button 
              onClick={() => copyToClipboard(contract.original_content)}
              className="btn btn-sm btn-outline flex items-center"
            >
              {copied ? <FiCheck className="mr-1" /> : <FiCopy className="mr-1" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="bg-secondary-50 p-4 rounded-lg max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap font-sans text-secondary-800">
              {contract.original_content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
