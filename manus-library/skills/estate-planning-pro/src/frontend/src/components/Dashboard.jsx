import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { assetsAPI, beneficiariesAPI, taxAPI } from '../lib/api';
import { DollarSign, TrendingUp, Users, FileText, AlertTriangle, CheckCircle, Calculator } from 'lucide-react';

const Dashboard = ({ onPageChange }) => {
  const [netWorth, setNetWorth] = useState(null);
  const [beneficiariesSummary, setBeneficiariesSummary] = useState(null);
  const [taxCalculation, setTaxCalculation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [netWorthRes, beneficiariesRes, taxRes] = await Promise.all([
          assetsAPI.getNetWorth(),
          beneficiariesAPI.getBeneficiariesSummary(),
          taxAPI.getTaxCalculations()
        ]);

        setNetWorth(netWorthRes.data);
        setBeneficiariesSummary(beneficiariesRes.data);
        
        // Get the most recent tax calculation
        if (taxRes.data.calculations.length > 0) {
          setTaxCalculation(taxRes.data.calculations[0]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getEstateProgressItems = () => {
    const items = [
      {
        name: 'Assets Inventory',
        completed: netWorth && netWorth.total_assets > 0,
        description: 'Add your assets and liabilities'
      },
      {
        name: 'Beneficiaries',
        completed: beneficiariesSummary && beneficiariesSummary.primary_beneficiaries.count > 0,
        description: 'Designate your beneficiaries'
      },
      {
        name: 'Will Creation',
        completed: false, // This would be based on documents data
        description: 'Create your last will and testament'
      },
      {
        name: 'Tax Planning',
        completed: taxCalculation !== null,
        description: 'Calculate estate tax liability'
      }
    ];

    return items;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const progressItems = getEstateProgressItems();
  const completedItems = progressItems.filter(item => item.completed).length;
  const progressPercentage = (completedItems / progressItems.length) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Estate Planning Dashboard</h1>
        <p className="text-gray-600">Manage your estate planning and tax preparation</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {netWorth ? formatCurrency(netWorth.net_worth) : '$0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Assets: {netWorth ? formatCurrency(netWorth.total_assets) : '$0'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estate Tax Liability</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {taxCalculation ? formatCurrency(taxCalculation.estate_tax_liability) : '$0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on current estate value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beneficiaries</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {beneficiariesSummary ? beneficiariesSummary.primary_beneficiaries.count : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {beneficiariesSummary ? 
                `${beneficiariesSummary.primary_beneficiaries.total_percentage}% allocated` : 
                '0% allocated'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Completed documents
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estate Planning Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Estate Planning Progress</CardTitle>
          <CardDescription>
            Complete these steps to finalize your estate plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">
              {completedItems} of {progressItems.length} completed
            </span>
          </div>
          <Progress value={progressPercentage} className="w-full" />
          
          <div className="space-y-3">
            {progressItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {item.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <Badge variant={item.completed ? "default" : "secondary"}>
                  {item.completed ? "Complete" : "Pending"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks to manage your estate plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => onPageChange('assets')}
            >
              <DollarSign className="h-6 w-6 mb-2" />
              Add Assets
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => onPageChange('beneficiaries')}
            >
              <Users className="h-6 w-6 mb-2" />
              Add Beneficiaries
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => onPageChange('taxes')}
            >
              <Calculator className="h-6 w-6 mb-2" />
              Calculate Taxes
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => onPageChange('documents')}
            >
              <FileText className="h-6 w-6 mb-2" />
              Create Documents
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;



console.log('Dashboard component rendered');

