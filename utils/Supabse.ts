import {supabase} from './supabaseConfig'
  
interface Vendor{
    id: string
    name: string
    contact: number
    image: string
    status: boolean  
}

const VENDORS = 'Vendors';

export const fetchCustomer = async (
    vendorId: string | undefined,
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
}

export const updateCustomer = async (
    vendorId: string,
    status: boolean,
): Promise<void> => {
    const { data, error } = await supabase
        .from(VENDORS)
        .update({ status: status})
        .eq('id', vendorId);

    if (error) {
        console.error(error);
        return;
    }

}

   