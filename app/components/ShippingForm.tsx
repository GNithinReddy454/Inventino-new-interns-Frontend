"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useMemo, FormEvent } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { ShippingAddress } from "@/lib/types";
import {
  Lock,
  MapPin,
  Plus,
  Home,
  Briefcase,
  Globe,
  CheckCircle2,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { ProgressStepper } from "./ProgressStepper";
import { addressService } from "@/services/address.service";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { fetchAddressesAction } from "@/redux/addressslice";
import type { SavedAddress } from "@/types/address";
import { hasUserSession } from "@/lib/session";

interface ShippingFormProps {
  onSubmit: (address: ShippingAddress) => void;
}

export function ShippingForm({ onSubmit }: ShippingFormProps) {
  const dispatch = useAppDispatch();
  const { addresses: savedAddresses, isLoading: loadingAddresses } = useAppSelector((state) => state.address);

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  // Memoize filtered unique addresses to use in both logic and render
  const uniqueAddresses = useMemo(() => {
    return savedAddresses.filter((addr, index, self) => 
      index === self.findIndex((t) => (
        t.fullName === addr.fullName &&
        t.street === addr.street &&
        t.city === addr.city &&
        t.state === addr.state &&
        t.pincode === addr.pincode &&
        t.phone === addr.phone
      ))
    );
  }, [savedAddresses]);

  // Form state for new address
  const [formData, setFormData] = useState<ShippingAddress>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  });

  const [saveInfo, setSaveInfo] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const isFieldInvalid = (field: keyof ShippingAddress) => {
    const value = formData[field];
    return touched[field] && typeof value === 'string' && !value.trim();
  };

  // Fetch saved addresses on mount
  useEffect(() => {
    if (hasUserSession()) {
      dispatch(fetchAddressesAction());
    }
  }, [dispatch]);

  // Auto-select logic when addresses change
  useEffect(() => {
    if (uniqueAddresses.length > 0) {
      if (!selectedAddressId) {
        // ALWAYS select the first visible unique address by default
        setSelectedAddressId(uniqueAddresses[0]._id);
      }
    } else if (!loadingAddresses) {
      setShowNewForm(true);
    }
  }, [uniqueAddresses, loadingAddresses, selectedAddressId]);

  const handleChange = (field: keyof ShippingAddress, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitNewAddress = (e: FormEvent) => {
    e.preventDefault();
    
    // Mark all as touched on submit attempt
    const allTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach(key => allTouched[key] = true);
    setTouched(allTouched);

    if (isFormValid()) {
      onSubmit(formData);
    }
  };

  const handleSelectSavedAddress = () => {
    const addr = savedAddresses.find((a) => a._id === selectedAddressId);
    if (!addr) return;

    // Map SavedAddress to ShippingAddress
    const nameParts = (addr.fullName || "").split(" ");
    const shippingAddr: ShippingAddress = {
      _id: addr._id,
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      fullName: addr.fullName,
      email: addr.email || "",
      phone: addr.phone || "",
      street: addr.street,
      streetAddress: addr.street || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode,
      zipCode: addr.pincode || "",
      country: addr.country || "India",
    };
    onSubmit(shippingAddr);
  };

  const isFormValid = () => {
    return Object.values(formData).every((value) => typeof value === 'string' ? value.trim() !== "" : true);
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case "Home":
        return <Home size={16} />;
      case "Office":
        return <Briefcase size={16} />;
      default:
        return <Globe size={16} />;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
      {/* Progress Stepper */}
      <ProgressStepper currentStep="shipping" />

      {/* ── Saved Addresses Section ── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
            <MapPin className="text-pink-600 w-4 h-4" />
          </div>
          <h2 className="text-lg font-semibold">Select Delivery Address</h2>
        </div>

        {loadingAddresses ? (
          <div className="flex items-center justify-center py-10">
            <Loader2
              size={28}
              className="text-pink-500 animate-spin"
            />
            <span className="ml-3 text-sm text-gray-400">Loading saved addresses...</span>
          </div>
        ) : savedAddresses.length > 0 ? (
          <>
            {/* Address Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {uniqueAddresses.map((addr) => {
                const isSelected = selectedAddressId === addr._id && !showNewForm;
                return (
                  <button
                    key={addr._id}
                    type="button"
                    onClick={() => {
                      setSelectedAddressId(addr._id);
                      setShowNewForm(false);
                    }}
                    className={`relative text-left p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer group ${
                      isSelected
                        ? "border-pink-500 bg-pink-50/60 shadow-md shadow-pink-100"
                        : "border-gray-100 bg-white hover:border-pink-200 hover:shadow-sm"
                    }`}
                  >
                    {/* Selection indicator */}
                    <div
                      className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? "border-pink-500 bg-pink-500"
                          : "border-gray-300 bg-white group-hover:border-pink-300"
                      }`}
                    >
                      {isSelected && (
                        <CheckCircle2 size={14} className="text-white" />
                      )}
                    </div>

                    {/* Address Type Badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          isSelected
                            ? "bg-pink-500 text-white"
                            : "bg-pink-50 text-pink-500"
                        }`}
                      >
                        {getAddressIcon(addr.addressType)}
                      </span>
                      <span className="text-sm font-bold text-gray-800">
                        {addr.addressType}
                      </span>
                      {addr.isDefault && (
                        addr._id === savedAddresses.find(a => a.isDefault)?._id ? (
                          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                            Default
                          </span>
                        ) : null
                      )}
                    </div>

                    {/* Name & Phone */}
                    <p className="text-sm font-semibold text-gray-800 mb-0.5">
                      {addr.fullName}
                    </p>
                    <p className="text-xs text-gray-400 mb-1.5">{addr.phone}</p>

                    {/* Address */}
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {addr.street}
                      <br />
                      {addr.city}
                      {addr.state ? `, ${addr.state}` : ""} {addr.pincode}
                      {addr.country ? (
                        <>
                          <br />
                          {addr.country}
                        </>
                      ) : null}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Deliver to this address button */}
            {selectedAddressId && !showNewForm && (
              <Button
                type="button"
                onClick={handleSelectSavedAddress}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white py-6 text-base font-semibold rounded-xl shadow-lg shadow-pink-500/30 mb-3"
              >
                Deliver to This Address
              </Button>
            )}

            {/* Add New Address Toggle */}
            <button
              type="button"
              onClick={() => {
                setShowNewForm(!showNewForm);
                if (!showNewForm) {
                  setSelectedAddressId(null);
                }
              }}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-dashed transition-all font-semibold text-sm ${
                showNewForm
                  ? "border-pink-400 bg-pink-50 text-pink-600"
                  : "border-gray-200 bg-gray-50/50 text-gray-500 hover:border-pink-300 hover:text-pink-500 hover:bg-pink-50/30"
              }`}
            >
              <Plus size={16} />
              {showNewForm ? "Adding New Address" : "Add a New Address"}
              <ChevronDown
                size={14}
                className={`transition-transform ${showNewForm ? "rotate-180" : ""}`}
              />
            </button>
          </>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 mb-4">
            <MapPin size={28} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 font-medium">
              No saved addresses found
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Add a new delivery address below
            </p>
          </div>
        )}
      </div>

      {/* ── New Address Form ── */}
      {showNewForm && (
        <form onSubmit={handleSubmitNewAddress} className="space-y-6">
          <div
            className="bg-gradient-to-br from-pink-50/50 to-white rounded-xl p-5 border border-pink-100"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                <span className="text-pink-600 font-semibold text-sm">
                  <Plus size={16} />
                </span>
              </div>
              <h2 className="text-lg font-semibold">New Delivery Address</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="firstName"
                  className="text-sm text-gray-700 mb-1.5 block"
                >
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  placeholder="Enter First Name"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  onBlur={() => handleBlur("firstName")}
                  className={`bg-pink-50/50 border-pink-100 ${isFieldInvalid("firstName") ? "border-red-500 focus-visible:ring-red-200" : ""}`}
                />
                {isFieldInvalid("firstName") && (
                  <p className="text-red-500 text-[10px] mt-1 font-semibold ml-1 animate-in fade-in slide-in-from-top-1">This field is required</p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="lastName"
                  className="text-sm text-gray-700 mb-1.5 block"
                >
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  placeholder="Enter Last Name"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  onBlur={() => handleBlur("lastName")}
                  className={`bg-pink-50/50 border-pink-100 ${isFieldInvalid("lastName") ? "border-red-500 focus-visible:ring-red-200" : ""}`}
                />
                {isFieldInvalid("lastName") && (
                  <p className="text-red-500 text-[10px] mt-1 font-semibold ml-1 animate-in fade-in slide-in-from-top-1">This field is required</p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="email"
                  className="text-sm text-gray-700 mb-1.5 block"
                >
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@email.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  className={`bg-pink-50/50 border-pink-100 ${isFieldInvalid("email") ? "border-red-500 focus-visible:ring-red-200" : ""}`}
                />
                {isFieldInvalid("email") && (
                  <p className="text-red-500 text-[10px] mt-1 font-semibold ml-1 animate-in fade-in slide-in-from-top-1">This field is required</p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="phone"
                  className="text-sm text-gray-700 mb-1.5 block"
                >
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98456 71230"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  onBlur={() => handleBlur("phone")}
                  className={`bg-pink-50/50 border-pink-100 ${isFieldInvalid("phone") ? "border-red-500 focus-visible:ring-red-200" : ""}`}
                />
                {isFieldInvalid("phone") && (
                  <p className="text-red-500 text-[10px] mt-1 font-semibold ml-1 animate-in fade-in slide-in-from-top-1">This field is required</p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label
                  htmlFor="streetAddress"
                  className="text-sm text-gray-700 mb-1.5 block"
                >
                  Street Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="streetAddress"
                  placeholder="123 Main Street"
                  value={formData.streetAddress}
                  onChange={(e) =>
                    handleChange("streetAddress", e.target.value)
                  }
                  onBlur={() => handleBlur("streetAddress")}
                  className={`bg-pink-50/50 border-pink-100 ${isFieldInvalid("streetAddress") ? "border-red-500 focus-visible:ring-red-200" : ""}`}
                />
                {isFieldInvalid("streetAddress") && (
                  <p className="text-red-500 text-[10px] mt-1 font-semibold ml-1 animate-in fade-in slide-in-from-top-1">This field is required</p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="city"
                  className="text-sm text-gray-700 mb-1.5 block"
                >
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  placeholder="Hyderabad"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  onBlur={() => handleBlur("city")}
                  className={`bg-pink-50/50 border-pink-100 ${isFieldInvalid("city") ? "border-red-500 focus-visible:ring-red-200" : ""}`}
                />
                {isFieldInvalid("city") && (
                  <p className="text-red-500 text-[10px] mt-1 font-semibold ml-1 animate-in fade-in slide-in-from-top-1">This field is required</p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="state"
                  className="text-sm text-gray-700 mb-1.5 block"
                >
                  State <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="state"
                  placeholder="Telangana"
                  value={formData.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  onBlur={() => handleBlur("state")}
                  className={`bg-pink-50/50 border-pink-100 ${isFieldInvalid("state") ? "border-red-500 focus-visible:ring-red-200" : ""}`}
                />
                {isFieldInvalid("state") && (
                  <p className="text-red-500 text-[10px] mt-1 font-semibold ml-1 animate-in fade-in slide-in-from-top-1">This field is required</p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="zipCode"
                  className="text-sm text-gray-700 mb-1.5 block"
                >
                  PIN / ZIP Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="zipCode"
                  placeholder="500033"
                  value={formData.zipCode}
                  onChange={(e) => handleChange("zipCode", e.target.value)}
                  onBlur={() => handleBlur("zipCode")}
                  className={`bg-pink-50/50 border-pink-100 ${isFieldInvalid("zipCode") ? "border-red-500 focus-visible:ring-red-200" : ""}`}
                />
                {isFieldInvalid("zipCode") && (
                  <p className="text-red-500 text-[10px] mt-1 font-semibold ml-1 animate-in fade-in slide-in-from-top-1">This field is required</p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="country"
                  className="text-sm text-gray-700 mb-1.5 block"
                >
                  Country <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => handleChange("country", value)}
                >
                  <SelectTrigger className="bg-pink-50/50 border-pink-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="United Kingdom">
                      United Kingdom
                    </SelectItem>
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
                    <SelectItem value="Czech Republic">
                      Czech Republic
                    </SelectItem>
                    <SelectItem value="Hungary">Hungary</SelectItem>
                    <SelectItem value="Romania">Romania</SelectItem>
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
                    <SelectItem value="United Arab Emirates">
                      United Arab Emirates
                    </SelectItem>
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
            className={`w-full py-6 text-base font-semibold rounded-xl shadow-lg transition-all ${
              isFormValid()
                ? "bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white shadow-pink-500/30 cursor-pointer"
                : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none opacity-60"
            }`}
          >
            Proceed to Checkout
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full border-pink-200 text-pink-600 hover:bg-pink-600 hover:text-white hover:border-pink-600 py-6 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
          >
            Continue Shopping
          </Button>
        </form>
      )}
    </div>
  );
}
