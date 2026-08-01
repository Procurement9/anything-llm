import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { taxAPI, assetsAPI } from '../lib/api';
import { Calculator, TrendingUp, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react';

const taxCalculationSchema = z.object({
  tax_year: z.string().min(1, 'Tax year is required'),
  funeral_expenses: z.string().optional(),
  administration_expenses: z.string().optional(),
  charitable_deductions: z.string().optional(),
  marital_deductions: z.string().optional(),
  gift_tax_liability: z.string().optional(),
});

const TaxCalculator = () => {
  const [calculations, setCalculations] = useState([]);
  const [currentCalculation, setCurrentCalculation] = useState(null);
  const [netWorth, setNetWorth] = useState(null);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(taxCalculationSchema),
    defaultValues: {
      tax_year: new Date().getFullYear().toString(),
      funeral_expenses: '0',
      administration_expenses: '0',
      charitable_deductions: '0',
      marital_deductions: '0',
      gift_tax_liability: '0',
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [calculationsRes, netWorthRes] = await Promise.all([
        taxAPI.getTaxCalculations(),
        assetsAPI.getNetWorth()
      ]);

      setCalculations(calculationsRes.data.calculations);
      setNetWorth(netWorthRes.data);

      if (calculationsRes.data.calculations.length > 0) {
        setCurrentCalculation(calculationsRes.data.calculations[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = {
        ...data,
        tax_year: parseInt(data.tax_year),
        funeral_expenses: parseFloat(data.funeral_expenses || 0),
        administration_expenses: parseFloat(data.administration_expenses || 0),
        charitable_deductions: parseFloat(data.charitable_deductions || 0),
        marital_deductions: parseFloat(data.marital_deductions || 0),
        gift_tax_liability: parseFloat(data.gift_tax_liability || 0),
      };

      const response = await taxAPI.calculateTaxes(formData);
      setCurrentCalculation(response.data.calculation);
      await fetchData();
    } catch (error) {
      console.error('Error calculating taxes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptimizationSuggestions = async () => {
    try {
      const response = await taxAPI.getOptimizationSuggestions({
        has_business_interests: false // This could be determined from assets
      });
      setOptimizationSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching optimization suggestions:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };

  const ESTATE_TAX_EXEMPTION_2025 = 13990000;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tax Calculator</h1>
          <p className="text-gray-600">Calculate estate tax liability and explore optimization strategies</p>
        </div>
      </div>

      {/* Current Estate Overview */}
      {netWorth && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Current Estate Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(netWorth.net_worth)}</div>
              <p className="text-xs text-muted-foreground">
                Assets: {formatCurrency(netWorth.total_assets)} | Liabilities: {formatCurrency(netWorth.total_liabilities)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Federal Exemption (2025)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(ESTATE_TAX_EXEMPTION_2025)}</div>
              <p className="text-xs text-muted-foreground">
                {netWorth.net_worth > ESTATE_TAX_EXEMPTION_2025 ? 'Above exemption limit' : 'Below exemption limit'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Potential Tax Liability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentCalculation ? formatCurrency(currentCalculation.estate_tax_liability) : '$0'}
              </div>
              <p className="text-xs text-muted-foreground">
                Based on current calculation
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator">Tax Calculator</TabsTrigger>
          <TabsTrigger value="history">Calculation History</TabsTrigger>
          <TabsTrigger value="optimization">Tax Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estate Tax Calculation</CardTitle>
              <CardDescription>
                Calculate your estate tax liability based on current assets and deductions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="tax_year">Tax Year</Label>
                    <Input
                      id="tax_year"
                      type="number"
                      {...register('tax_year')}
                      className={errors.tax_year ? 'border-red-500' : ''}
                    />
                    {errors.tax_year && (
                      <p className="text-sm text-red-500 mt-1">{errors.tax_year.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="funeral_expenses">Funeral Expenses ($)</Label>
                    <Input
                      id="funeral_expenses"
                      type="number"
                      step="0.01"
                      {...register('funeral_expenses')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="administration_expenses">Administration Expenses ($)</Label>
                    <Input
                      id="administration_expenses"
                      type="number"
                      step="0.01"
                      {...register('administration_expenses')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="charitable_deductions">Charitable Deductions ($)</Label>
                    <Input
                      id="charitable_deductions"
                      type="number"
                      step="0.01"
                      {...register('charitable_deductions')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="marital_deductions">Marital Deductions ($)</Label>
                    <Input
                      id="marital_deductions"
                      type="number"
                      step="0.01"
                      {...register('marital_deductions')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="gift_tax_liability">Gift Tax Liability ($)</Label>
                    <Input
                      id="gift_tax_liability"
                      type="number"
                      step="0.01"
                      {...register('gift_tax_liability')}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading && <Calculator className="mr-2 h-4 w-4 animate-spin" />}
                  Calculate Estate Tax
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Calculation Results */}
          {currentCalculation && (
            <Card>
              <CardHeader>
                <CardTitle>Tax Calculation Results</CardTitle>
                <CardDescription>
                  Results for tax year {currentCalculation.tax_year}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Gross Estate Value:</span>
                      <span className="text-sm">{formatCurrency(currentCalculation.gross_estate_value)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Total Deductions:</span>
                      <span className="text-sm">{formatCurrency(currentCalculation.total_deductions)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Taxable Estate:</span>
                      <span className="text-sm">{formatCurrency(currentCalculation.taxable_estate)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Federal Exemption:</span>
                      <span className="text-sm">{formatCurrency(ESTATE_TAX_EXEMPTION_2025)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Estate Tax Liability:</span>
                      <span className="text-sm font-bold text-red-600">
                        {formatCurrency(currentCalculation.estate_tax_liability)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Effective Tax Rate:</span>
                      <span className="text-sm">
                        {currentCalculation.calculation_details?.tax_calculation?.effective_tax_rate 
                          ? formatPercentage(currentCalculation.calculation_details.tax_calculation.effective_tax_rate)
                          : '0%'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {currentCalculation.estate_tax_liability > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Your estate may be subject to federal estate tax. Consider tax optimization strategies to reduce liability.
                    </AlertDescription>
                  </Alert>
                )}

                {currentCalculation.estate_tax_liability === 0 && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your estate is currently below the federal exemption limit and would not owe estate tax.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calculation History</CardTitle>
              <CardDescription>
                Previous tax calculations and comparisons
              </CardDescription>
            </CardHeader>
            <CardContent>
              {calculations.length > 0 ? (
                <div className="space-y-4">
                  {calculations.map((calc) => (
                    <div key={calc.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">Tax Year {calc.tax_year}</h3>
                          <p className="text-sm text-muted-foreground">
                            Calculated on {new Date(calc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">Estate Tax Liability</p>
                          <p className="text-lg font-bold text-red-600">
                            {formatCurrency(calc.estate_tax_liability)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Gross Estate:</span>
                          <br />
                          <span className="font-medium">{formatCurrency(calc.gross_estate_value)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Deductions:</span>
                          <br />
                          <span className="font-medium">{formatCurrency(calc.total_deductions)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Taxable Estate:</span>
                          <br />
                          <span className="font-medium">{formatCurrency(calc.taxable_estate)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No tax calculations yet. Use the calculator to get started.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tax Optimization Strategies</CardTitle>
              <CardDescription>
                Explore strategies to minimize your estate tax liability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={fetchOptimizationSuggestions} className="mb-4">
                <TrendingUp className="mr-2 h-4 w-4" />
                Get Optimization Suggestions
              </Button>

              {optimizationSuggestions && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium text-green-600">Current Estate Value</h3>
                      <p className="text-2xl font-bold">{formatCurrency(optimizationSuggestions.current_estate_value)}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium text-red-600">Potential Tax Liability</h3>
                      <p className="text-2xl font-bold">{formatCurrency(optimizationSuggestions.potential_tax_liability)}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Recommended Strategies</h3>
                    {optimizationSuggestions.optimization_suggestions.map((suggestion, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{suggestion.strategy}</h4>
                          <Badge variant={
                            suggestion.complexity === 'Low' ? 'default' :
                            suggestion.complexity === 'Medium' ? 'secondary' : 'destructive'
                          }>
                            {suggestion.complexity} Complexity
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{suggestion.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-green-600">
                            Potential Savings: {formatCurrency(suggestion.potential_savings)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {optimizationSuggestions && optimizationSuggestions.optimization_suggestions.length === 0 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your estate is currently optimized for tax efficiency. Continue monitoring as your estate grows.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaxCalculator;

