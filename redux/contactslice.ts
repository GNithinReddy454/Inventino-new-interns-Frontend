import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { contactService, ContactData } from "@/services/contact.service";

interface ContactState {
    isLoading: boolean;
    success: boolean;
    error: string | null;
}

const initialState: ContactState = {
    isLoading: false,
    success: false,
    error: null,
};

export const submitContact = createAsyncThunk(
    "contact/submit",
    async (contactData: ContactData, { rejectWithValue }) => {
        try {
            const response = await contactService.createContact(contactData);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to submit contact inquiry"
            );
        }
    }
);

const contactSlice = createSlice({
    name: "contact",
    initialState,
    reducers: {
        resetContactState: (state) => {
            state.isLoading = false;
            state.success = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(submitContact.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(submitContact.fulfilled, (state) => {
                state.isLoading = false;
                state.success = true;
            })
            .addCase(submitContact.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { resetContactState } = contactSlice.actions;
export default contactSlice.reducer;
