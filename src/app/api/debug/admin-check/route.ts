import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  
  // 1. Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return NextResponse.json({ 
      step: 'auth', 
      error: userError?.message || 'No user',
      user: null 
    });
  }
  
  // 2. Check platform_admins query
  const { data: isAdmin, error: adminError } = await supabase
    .from('platform_admins')
    .select('id, user_id, email')
    .eq('user_id', user.id)
    .single();
  
  return NextResponse.json({
    step: 'complete',
    user: {
      id: user.id,
      email: user.email
    },
    adminQuery: {
      data: isAdmin,
      error: adminError?.message || null,
      code: adminError?.code || null
    }
  });
}
