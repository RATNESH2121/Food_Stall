import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
      
      <Card className="p-6 space-y-6">
        <div className="flex items-center space-x-4 border-b pb-6">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold uppercase">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 capitalize">{user?.full_name}</h2>
            <p className="text-slate-500 capitalize">{user?.role}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Registration Number</label>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-slate-900">
              {user?.registration_number}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Phone Number</label>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-slate-900">
              {user?.phone_number || 'N/A'}
            </div>
          </div>
        </div>
        
        <div className="pt-4">
          <p className="text-sm text-slate-500">To change your password or phone number, please contact administration.</p>
        </div>
      </Card>
    </div>
  );
}
