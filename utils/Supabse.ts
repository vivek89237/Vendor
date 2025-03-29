import {supabase} from './supabaseConfig'
  
interface Vendor{
    id: string
    name: string
    contact: string
    image: string
}

const VENDORS = 'Vendors';

export const fetchCustomer = async (
    vendorId: string,
    setVendor: (vendor: Vendor | null) => void
): Promise<void> => {
    const { data, error } = await supabase
        .from(VENDORS)
        .select('*')
        .eq('id', vendorId);

    if (error) {
        console.error(error);
        return;
    }
    
    setVendor(data ? data[0] : null);
};

   