import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { assetsAPI } from '../lib/api';
import { Plus, Edit, Trash2, Home, Briefcase, Banknote, TrendingUp } from 'lucide-react';

const assetSchema = z.object({
  asset_type: z.string().min(1, 'Asset type is required'),
  description: z.string().min(1, 'Description is required'),
  current_value: z.string().min(1, 'Current value is required'),
  acquisition_cost: z.string().optional(),
  acquisition_date: z.string().optional(),
  location: z.string().optional(),
  ownership_type: z.string().optional(),
});

const liabilitySchema = z.object({
  liability_type: z.string().min(1, 'Liability type is required'),
  description: z.string().min(1, 'Description is required'),
  current_balance: z.string().min(1, 'Current balance is required'),
  interest_rate: z.string().optional(),
  monthly_payment: z.string().optional(),
  creditor_name: z.string().optional(),
  maturity_date: z.string().optional(),
});

const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [liabilities, setLiabilities] = useState([]);
  const [netWorth, setNetWorth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activeTab, setActiveTab] = useState('assets');

  const assetForm = useForm({
    resolver: zodResolver(assetSchema),
  });

  const liabilityForm = useForm({
    resolver: zodResolver(liabilitySchema),
  });

  const fetchData = async () => {
    try {
      const [assetsRes, liabilitiesRes, netWorthRes] = await Promise.all([
        assetsAPI.getAssets(),
        assetsAPI.getLiabilities(),
        assetsAPI.getNetWorth()
      ]);

      setAssets(assetsRes.data.assets);
      setLiabilities(liabilitiesRes.data.liabilities);
      setNetWorth(netWorthRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (data, isAsset = true) => {
    try {
      const formData = {
        ...data,
        [isAsset ? 'current_value' : 'current_balance']: parseFloat(data[isAsset ? 'current_value' : 'current_balance']),
        acquisition_cost: data.acquisition_cost ? parseFloat(data.acquisition_cost) : undefined,
        interest_rate: data.interest_rate ? parseFloat(data.interest_rate) : undefined,
        monthly_payment: data.monthly_payment ? parseFloat(data.monthly_payment) : undefined,
      };

      if (editingItem) {
        if (isAsset) {
          await assetsAPI.updateAsset(editingItem.id, formData);
        } else {
          await assetsAPI.updateLiability(editingItem.id, formData);
        }
      } else {
        if (isAsset) {
          await assetsAPI.createAsset(formData);
        } else {
          await assetsAPI.createLiability(formData);
        }
      }

      await fetchData();
      setDialogOpen(false);
      setEditingItem(null);
      if (isAsset) {
        assetForm.reset();
      } else {
        liabilityForm.reset();
      }
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleDelete = async (id, isAsset = true) => {
    try {
      if (isAsset) {
        await assetsAPI.deleteAsset(id);
      } else {
        await assetsAPI.deleteLiability(id);
      }
      await fetchData();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const openDialog = (item = null, isAsset = true) => {
    setEditingItem(item);
    setActiveTab(isAsset ? 'assets' : 'liabilities');
    
    if (item) {
      if (isAsset) {
        assetForm.reset({
          ...item,
          current_value: item.current_value.toString(),
          acquisition_cost: item.acquisition_cost?.toString() || '',
        });
      } else {
        liabilityForm.reset({
          ...item,
          current_balance: item.current_balance.toString(),
          interest_rate: item.interest_rate?.toString() || '',
          monthly_payment: item.monthly_payment?.toString() || '',
        });
      }
    } else {
      if (isAsset) {
        assetForm.reset();
      } else {
        liabilityForm.reset();
      }
    }
    
    setDialogOpen(true);
  };

  const getAssetIcon = (type) => {
    switch (type) {
      case 'real_estate': return <Home className="h-4 w-4" />;
      case 'investment': return <TrendingUp className="h-4 w-4" />;
      case 'bank_account': return <Banknote className="h-4 w-4" />;
      default: return <Briefcase className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assets & Liabilities</h1>
          <p className="text-gray-600">Manage your estate's assets and liabilities</p>
        </div>
      </div>

      {/* Net Worth Summary */}
      {netWorth && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Total Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(netWorth.total_assets)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Total Liabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(netWorth.total_liabilities)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Net Worth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(netWorth.net_worth)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="assets" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assets">Assets ({assets.length})</TabsTrigger>
          <TabsTrigger value="liabilities">Liabilities ({liabilities.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Assets</h2>
            <Button onClick={() => openDialog(null, true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Asset
            </Button>
          </div>

          <div className="grid gap-4">
            {assets.map((asset) => (
              <Card key={asset.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getAssetIcon(asset.asset_type)}
                      <div>
                        <h3 className="font-medium">{asset.description}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Badge variant="secondary">{asset.asset_type.replace('_', ' ')}</Badge>
                          {asset.location && <span>• {asset.location}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold">{formatCurrency(asset.current_value)}</span>
                      <Button variant="ghost" size="sm" onClick={() => openDialog(asset, true)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(asset.id, true)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {assets.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">No assets added yet. Click "Add Asset" to get started.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="liabilities" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Liabilities</h2>
            <Button onClick={() => openDialog(null, false)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Liability
            </Button>
          </div>

          <div className="grid gap-4">
            {liabilities.map((liability) => (
              <Card key={liability.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Briefcase className="h-4 w-4" />
                      <div>
                        <h3 className="font-medium">{liability.description}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Badge variant="secondary">{liability.liability_type.replace('_', ' ')}</Badge>
                          {liability.creditor_name && <span>• {liability.creditor_name}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-red-600">
                        {formatCurrency(liability.current_balance)}
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => openDialog(liability, false)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(liability.id, false)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {liabilities.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">No liabilities added yet. Click "Add Liability" to get started.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit' : 'Add'} {activeTab === 'assets' ? 'Asset' : 'Liability'}
            </DialogTitle>
            <DialogDescription>
              {activeTab === 'assets' 
                ? 'Add details about your asset' 
                : 'Add details about your liability'
              }
            </DialogDescription>
          </DialogHeader>

          {activeTab === 'assets' ? (
            <form onSubmit={assetForm.handleSubmit((data) => handleSubmit(data, true))} className="space-y-4">
              <div>
                <Label htmlFor="asset_type">Asset Type</Label>
                <Select onValueChange={(value) => assetForm.setValue('asset_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select asset type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="real_estate">Real Estate</SelectItem>
                    <SelectItem value="bank_account">Bank Account</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                    <SelectItem value="retirement_account">Retirement Account</SelectItem>
                    <SelectItem value="life_insurance">Life Insurance</SelectItem>
                    <SelectItem value="personal_property">Personal Property</SelectItem>
                    <SelectItem value="business_interest">Business Interest</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input {...assetForm.register('description')} placeholder="e.g., Primary residence" />
              </div>

              <div>
                <Label htmlFor="current_value">Current Value ($)</Label>
                <Input {...assetForm.register('current_value')} type="number" step="0.01" />
              </div>

              <div>
                <Label htmlFor="acquisition_cost">Acquisition Cost ($)</Label>
                <Input {...assetForm.register('acquisition_cost')} type="number" step="0.01" />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input {...assetForm.register('location')} placeholder="e.g., 123 Main St, City, State" />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingItem ? 'Update' : 'Add'} Asset
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={liabilityForm.handleSubmit((data) => handleSubmit(data, false))} className="space-y-4">
              <div>
                <Label htmlFor="liability_type">Liability Type</Label>
                <Select onValueChange={(value) => liabilityForm.setValue('liability_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select liability type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mortgage">Mortgage</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="personal_loan">Personal Loan</SelectItem>
                    <SelectItem value="auto_loan">Auto Loan</SelectItem>
                    <SelectItem value="student_loan">Student Loan</SelectItem>
                    <SelectItem value="business_loan">Business Loan</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input {...liabilityForm.register('description')} placeholder="e.g., Home mortgage" />
              </div>

              <div>
                <Label htmlFor="current_balance">Current Balance ($)</Label>
                <Input {...liabilityForm.register('current_balance')} type="number" step="0.01" />
              </div>

              <div>
                <Label htmlFor="creditor_name">Creditor Name</Label>
                <Input {...liabilityForm.register('creditor_name')} placeholder="e.g., ABC Bank" />
              </div>

              <div>
                <Label htmlFor="interest_rate">Interest Rate (%)</Label>
                <Input {...liabilityForm.register('interest_rate')} type="number" step="0.01" />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingItem ? 'Update' : 'Add'} Liability
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Assets;

