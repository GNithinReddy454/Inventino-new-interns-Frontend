'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { ShippingAddress } from '@/lib/types';
import { Lock } from 'lucide-react';

interface ShippingFormProps {
  onSubmit: (address: ShippingAddress) => void;
}

export function ShippingForm({ onSubmit }: ShippingFormProps) {
  const [formData, setFormData] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });

  const [saveInfo, setSaveInfo] = useState(false);

  const handleChange = (field: keyof ShippingAddress, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isFormValid = () => {
    return Object.values(formData).every((value) => value.trim() !== '');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
      {/* Progress Steps */}
      <div className="mb-8">
        {/* Header with Secure Checkout */}
        <div className="flex items-center justify-end mb-4">
          <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
            <Lock className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Secure Checkout</span>
          </div>
        </div>

        <div className="flex items-center justify-between relative">
          {/* Cart - Step 1 */}
          <div className="flex flex-col items-center relative z-10">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold shadow-md">
              ✓
            </div>
            <p className="text-xs font-medium text-green-600 mt-2">Cart</p>
          </div>

          {/* Information - Step 2 */}
          <div className="flex flex-col items-center relative z-10">
            <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white font-semibold shadow-md">
              2
            </div>
            <p className="text-xs font-medium text-pink-600 mt-2">Information</p>
          </div>

          {/* Payment - Step 3 */}
          <div className="flex flex-col items-center relative z-10">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold">
              3
            </div>
            <p className="text-xs font-medium text-gray-400 mt-2">Payment</p>
          </div>

          {/* Complete - Step 4 */}
          <div className="flex flex-col items-center relative z-10">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold">
              4
            </div>
            <p className="text-xs font-medium text-gray-400 mt-2">Complete</p>
          </div>

          {/* Progress Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 transform -translate-y-1/2" style={{ zIndex: 0 }}>
            <div className="h-full bg-gradient-to-r from-green-500 via-pink-500 to-pink-500" style={{ width: '50%' }} />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
              <span className="text-pink-600 font-semibold text-sm">1</span>
            </div>
            <h2 className="text-lg font-semibold">Shipping Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="text-sm text-gray-700 mb-1.5 block">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                placeholder="Enter First Name"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className="bg-pink-50/50 border-pink-100"
                required
              />
            </div>

            <div>
              <Label htmlFor="lastName" className="text-sm text-gray-700 mb-1.5 block">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                placeholder="Enter First Name"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className="bg-pink-50/50 border-pink-100"
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm text-gray-700 mb-1.5 block">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@email.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="bg-pink-50/50 border-pink-100"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-sm text-gray-700 mb-1.5 block">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="bg-pink-50/50 border-pink-100"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="streetAddress" className="text-sm text-gray-700 mb-1.5 block">
                Street Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="streetAddress"
                placeholder="123 Main Street"
                value={formData.streetAddress}
                onChange={(e) => handleChange('streetAddress', e.target.value)}
                className="bg-pink-50/50 border-pink-100"
                required
              />
            </div>

            <div>
              <Label htmlFor="city" className="text-sm text-gray-700 mb-1.5 block">
                City <span className="text-red-500">*</span>
              </Label>
              <Input
                id="city"
                placeholder="New York"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="bg-pink-50/50 border-pink-100"
                required
              />
            </div>

            <div>
              <Label htmlFor="state" className="text-sm text-gray-700 mb-1.5 block">
                State <span className="text-red-500">*</span>
              </Label>
              <Input
                id="state"
                placeholder="New York"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                className="bg-pink-50/50 border-pink-100"
                required
              />
            </div>

            <div>
              <Label htmlFor="zipCode" className="text-sm text-gray-700 mb-1.5 block">
                ZIP Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="zipCode"
                placeholder="10001"
                value={formData.zipCode}
                onChange={(e) => handleChange('zipCode', e.target.value)}
                className="bg-pink-50/50 border-pink-100"
                required
              />
            </div>

            <div>
              <Label htmlFor="country" className="text-sm text-gray-700 mb-1.5 block">
                Country <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.country} onValueChange={(value) => handleChange('country', value)}>
                <SelectTrigger className="bg-pink-50/50 border-pink-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                  <SelectItem value="Australia">Australia</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
                  <SelectItem value="France">France</SelectItem>
                  <SelectItem value="Italy">Italy</SelectItem>
                  <SelectItem value="Spain">Spain</SelectItem>
                  <SelectItem value="Netherlands">Netherlands</SelectItem>
                  <SelectItem value="Belgium">Belgium</SelectItem>
                  <SelectItem value="Switzerland">Switzerland</SelectItem>
                  <SelectItem value="Austria">Austria</SelectItem>
                  <SelectItem value="Sweden">Sweden</SelectItem>
                  <SelectItem value="Norway">Norway</SelectItem>
                  <SelectItem value="Denmark">Denmark</SelectItem>
                  <SelectItem value="Finland">Finland</SelectItem>
                  <SelectItem value="Poland">Poland</SelectItem>
                  <SelectItem value="Ireland">Ireland</SelectItem>
                  <SelectItem value="Portugal">Portugal</SelectItem>
                  <SelectItem value="Greece">Greece</SelectItem>
                  <SelectItem value="Czech Republic">Czech Republic</SelectItem>
                  <SelectItem value="Hungary">Hungary</SelectItem>
                  <SelectItem value="Romania">Romania</SelectItem>
                  <SelectItem value="India">India</SelectItem>
                  <SelectItem value="China">China</SelectItem>
                  <SelectItem value="Japan">Japan</SelectItem>
                  <SelectItem value="South Korea">South Korea</SelectItem>
                  <SelectItem value="Singapore">Singapore</SelectItem>
                  <SelectItem value="Malaysia">Malaysia</SelectItem>
                  <SelectItem value="Thailand">Thailand</SelectItem>
                  <SelectItem value="Indonesia">Indonesia</SelectItem>
                  <SelectItem value="Philippines">Philippines</SelectItem>
                  <SelectItem value="Vietnam">Vietnam</SelectItem>
                  <SelectItem value="Hong Kong">Hong Kong</SelectItem>
                  <SelectItem value="Taiwan">Taiwan</SelectItem>
                  <SelectItem value="New Zealand">New Zealand</SelectItem>
                  <SelectItem value="South Africa">South Africa</SelectItem>
                  <SelectItem value="Brazil">Brazil</SelectItem>
                  <SelectItem value="Mexico">Mexico</SelectItem>
                  <SelectItem value="Argentina">Argentina</SelectItem>
                  <SelectItem value="Chile">Chile</SelectItem>
                  <SelectItem value="Colombia">Colombia</SelectItem>
                  <SelectItem value="Peru">Peru</SelectItem>
                  <SelectItem value="United Arab Emirates">United Arab Emirates</SelectItem>
                  <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                  <SelectItem value="Israel">Israel</SelectItem>
                  <SelectItem value="Turkey">Turkey</SelectItem>
                  <SelectItem value="Russia">Russia</SelectItem>
                  <SelectItem value="Ukraine">Ukraine</SelectItem>
                  <SelectItem value="Egypt">Egypt</SelectItem>
                  <SelectItem value="Nigeria">Nigeria</SelectItem>
                  <SelectItem value="Kenya">Kenya</SelectItem>
                  <SelectItem value="Ghana">Ghana</SelectItem>
                  <SelectItem value="Morocco">Morocco</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2 mt-4">
            <Checkbox
              id="saveInfo"
              checked={saveInfo}
              onCheckedChange={(checked) => setSaveInfo(checked as boolean)}
              className="border-pink-300 data-[state=checked]:bg-pink-500"
            />
            <Label
              htmlFor="saveInfo"
              className="text-sm text-gray-600 cursor-pointer"
            >
              Save this information for next time
            </Label>
          </div>
        </div>

        <Button
          type="submit"
          disabled={!isFormValid()}
          className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white py-6 text-base font-semibold rounded-xl shadow-lg shadow-pink-500/30"
        >
          Proceed to Checkout
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full border-pink-200 text-pink-600 hover:bg-pink-50 py-6 rounded-xl"
        >
          Continue Shopping
        </Button>
      </form>
    </div>
  );
}
