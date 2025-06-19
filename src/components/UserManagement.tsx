'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/contexts/UserContext";
import { UserRole } from "@/contexts/UserContext";
import { Plus, Edit, Trash2, Eye, Mail, Shield } from "lucide-react";

interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  createdBy: {
    username: string;
  };
}

interface CreateUserData {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

const ROLE_COLORS = {
  admin: 'bg-red-100 text-red-800 border-red-200',
  'sub-admin': 'bg-orange-100 text-orange-800 border-orange-200',
  manager: 'bg-blue-100 text-blue-800 border-blue-200',
  staff: 'bg-green-100 text-green-800 border-green-200',
  'customer-support': 'bg-purple-100 text-purple-800 border-purple-200'
};

const ROLE_PERMISSIONS = {
  admin: ['Dashboard', 'Leads', 'Add Leads', 'Pipeline', 'Follow Up', 'Search', 'Settings', 'User Management'],
  'sub-admin': ['Dashboard', 'Leads', 'Add Leads', 'Pipeline', 'Follow Up', 'Search', 'Settings'],
  manager: ['Dashboard', 'Leads', 'Add Leads', 'Pipeline', 'Follow Up', 'Search'],
  staff: ['Leads', 'Add Leads', 'Pipeline', 'Follow Up', 'Search'],
  'customer-support': ['Pipeline', 'Follow Up', 'Search']
};

export default function UserManagement() {
  const { toast } = useToast();
  const { user: currentUser } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [createUserData, setCreateUserData] = useState<CreateUserData>({
    username: '',
    email: '',
    password: '',
    role: 'staff'
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Create user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if trying to create admin and one already exists
    if (createUserData.role === 'admin') {
      const existingAdmin = users.find(user => user.role === 'admin');
      if (existingAdmin) {
        toast({
          title: "Error",
          description: "Only one admin user is allowed. Please change the existing admin's role first.",
          variant: "destructive",
        });
        return;
      }
    }
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createUserData,
          createdBy: currentUser?.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }

      const data = await response.json();
      setUsers([data.user, ...users]);
      setIsCreateModalOpen(false);
      setCreateUserData({
        username: '',
        email: '',
        password: '',
        role: 'staff'
      });

      toast({
        title: "Success",
        description: "User created successfully. Welcome email sent!",
      });
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    }
  };

  // Update user
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    // Check if trying to update to admin and one already exists
    if (selectedUser.role === 'admin') {
      const existingAdmin = users.find(user => user.role === 'admin' && user.id !== selectedUser.id);
      if (existingAdmin) {
        toast({
          title: "Error",
          description: "Only one admin user is allowed. Please change the existing admin's role first.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: selectedUser.username,
          email: selectedUser.email,
          role: selectedUser.role,
          isActive: selectedUser.isActive
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }

      const data = await response.json();
      setUsers(users.map(u => u.id === selectedUser.id ? data.user : u));
      setIsEditModalOpen(false);
      setSelectedUser(null);

      toast({
        title: "Success",
        description: "User updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      setUsers(users.filter(u => u.id !== userToDelete.id));
      setIsDeleteModalOpen(false);
      setUserToDelete(null);

      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  // Generate random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCreateUserData({ ...createUserData, password });
  };

  if (loading) {
    return (
      <Card className="glass-card shadow-premium border-blue-200/30">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-200 rounded"></div>
              <div className="h-4 bg-slate-200 rounded w-5/6"></div>
              <div className="h-4 bg-slate-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-card shadow-premium border-blue-200/30">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gradient-secondary">User Management</h2>
            <p className="text-sm text-slate-500 mt-1">Manage user accounts and permissions</p>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="hover-scale shadow-premium">
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50">
                              <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-green-800">
                    <Plus className="w-5 h-5" />
                    Create New User
                  </DialogTitle>
                  <DialogDescription className="text-green-700">
                    Add a new user to the system. They will receive login details via email.
                  </DialogDescription>
                </DialogHeader>
                              <form onSubmit={handleCreateUser}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-green-700 font-medium">Username</Label>
                      <Input
                        id="username"
                        placeholder="Enter username"
                        value={createUserData.username}
                        onChange={(e) => setCreateUserData({...createUserData, username: e.target.value})}
                        required
                        className="bg-white/80 border-green-200 focus:border-green-400 focus:ring-green-400/20"
                      />
                    </div>
                                      <div className="space-y-2">
                      <Label htmlFor="email" className="text-green-700 font-medium">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="user@company.com"
                        value={createUserData.email}
                        onChange={(e) => setCreateUserData({...createUserData, email: e.target.value})}
                        required
                        className="bg-white/80 border-green-200 focus:border-green-400 focus:ring-green-400/20"
                      />
                    </div>
                                      <div className="space-y-2">
                      <Label htmlFor="password" className="text-green-700 font-medium">Password</Label>
                      <div className="flex gap-2">
                        <Input
                          id="password"
                          type="text"
                          placeholder="Enter password"
                          value={createUserData.password}
                          onChange={(e) => setCreateUserData({...createUserData, password: e.target.value})}
                          required
                          className="bg-white/80 border-green-200 focus:border-green-400 focus:ring-green-400/20"
                        />
                        <Button type="button" variant="outline" onClick={generatePassword} className="border-green-200 text-green-700 hover:bg-green-50">
                          Generate
                        </Button>
                      </div>
                    </div>
                                      <div className="space-y-2">
                      <Label htmlFor="role" className="text-green-700 font-medium">Role</Label>
                      <Select
                        value={createUserData.role}
                        onValueChange={(value: UserRole) => setCreateUserData({...createUserData, role: value})}
                      >
                        <SelectTrigger className="bg-white/80 border-green-200 focus:border-green-400 focus:ring-green-400/20">
                          <SelectValue />
                        </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="customer-support">Customer Support</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="sub-admin">Sub Admin</SelectItem>
                        {(currentUser?.role === 'admin' || currentUser?.role === 'sub-admin') && !users.find(u => u.role === 'admin') && (
                          <SelectItem value="admin">Admin</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="mt-6 pt-6 border-t border-green-200/50">
                  <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)} className="border-green-200 text-green-700 hover:bg-green-50">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white shadow-lg">
                    Create User
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-lg border border-blue-200/30 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-50/30">
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => (
                <TableRow key={user.id || `user-${index}`}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.username}</div>
                      <div className="text-sm text-slate-500">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={ROLE_COLORS[user.role]}>
                      {user.role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                      <div className="text-xs text-slate-500">
                        by {user.createdBy?.username || 'System'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsViewModalOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsEditModalOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {user.id !== currentUser?.id && user.role !== 'admin' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteModal(user)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* View User Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-md bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-blue-800">
                <Eye className="w-5 h-5" />
                User Details
              </DialogTitle>
              <DialogDescription className="text-blue-700">
                View complete user information and permissions
              </DialogDescription>
            </DialogHeader>
                          {selectedUser && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-100/50 rounded-lg border border-blue-200/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                        <Shield className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-blue-900 text-lg">
                          {selectedUser.username}
                        </p>
                        <p className="text-sm text-blue-700">
                          {selectedUser.email}
                        </p>
                      </div>
                    </div>
                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/60 rounded-lg border border-blue-200/30">
                      <Label className="text-sm font-medium text-blue-600">Role</Label>
                      <div className="mt-1">
                        <Badge className={ROLE_COLORS[selectedUser.role]}>
                          {selectedUser.role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-3 bg-white/60 rounded-lg border border-blue-200/30">
                      <Label className="text-sm font-medium text-blue-600">Status</Label>
                      <div className="mt-1">
                        <Badge variant={selectedUser.isActive ? "default" : "secondary"}>
                          {selectedUser.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                                  <div className="p-3 bg-white/60 rounded-lg border border-blue-200/30">
                    <Label className="text-sm font-medium text-blue-600">Permissions</Label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {ROLE_PERMISSIONS[selectedUser.role].map((permission, index) => (
                        <Badge key={`${permission}-${index}`} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                                  <div className="p-3 bg-white/60 rounded-lg border border-blue-200/30">
                    <Label className="text-sm font-medium text-blue-600">Created</Label>
                    <p className="text-sm text-blue-800 mt-1">
                      {new Date(selectedUser.createdAt).toLocaleString()} by {selectedUser.createdBy?.username || 'System'}
                    </p>
                  </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit User Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-md bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200/50">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-amber-800">
                <Edit className="w-5 h-5" />
                Edit User
              </DialogTitle>
              <DialogDescription className="text-amber-700">
                Update user information and permissions
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <form onSubmit={handleUpdateUser}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-username" className="text-amber-700 font-medium">Username</Label>
                    <Input
                      id="edit-username"
                      value={selectedUser.username}
                      onChange={(e) => setSelectedUser({...selectedUser, username: e.target.value})}
                      required
                      className="bg-white/80 border-amber-200 focus:border-amber-400 focus:ring-amber-400/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email" className="text-amber-700 font-medium">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={selectedUser.email}
                      onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                      required
                      className="bg-white/80 border-amber-200 focus:border-amber-400 focus:ring-amber-400/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-role" className="text-amber-700 font-medium">Role</Label>
                    <Select
                      value={selectedUser.role}
                      onValueChange={(value: UserRole) => setSelectedUser({...selectedUser, role: value})}
                    >
                      <SelectTrigger className="bg-white/80 border-amber-200 focus:border-amber-400 focus:ring-amber-400/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="customer-support">Customer Support</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="sub-admin">Sub Admin</SelectItem>
                        {(currentUser?.role === 'admin' || currentUser?.role === 'sub-admin') && (selectedUser.role === 'admin' || !users.find(u => u.role === 'admin' && u.id !== selectedUser.id)) && (
                          <SelectItem value="admin">Admin</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-amber-100/50 rounded-xl border border-amber-200/50">
                    <div>
                      <Label className="text-base font-medium text-amber-800">Active Status</Label>
                      <p className="text-sm text-amber-600 mt-1">Enable or disable user account</p>
                    </div>
                    <Switch
                      checked={selectedUser.isActive}
                      onCheckedChange={(checked) => setSelectedUser({...selectedUser, isActive: checked})}
                      className="data-[state=checked]:bg-amber-600"
                    />
                  </div>
                </div>
                <DialogFooter className="mt-6 pt-6 border-t border-amber-200/50">
                  <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="border-amber-200 text-amber-700 hover:bg-amber-50">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg">
                    Update User
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete User Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="max-w-md bg-gradient-to-br from-red-50 to-orange-50 border-red-200/50">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-800">
                <Trash2 className="w-5 h-5" />
                Delete User Confirmation
              </DialogTitle>
              <DialogDescription className="text-red-700">
                This action cannot be undone. This will permanently delete the user account and remove all associated data.
              </DialogDescription>
            </DialogHeader>
            {userToDelete && (
              <div className="space-y-4">
                <div className="p-4 bg-red-100/50 rounded-lg border border-red-200/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center">
                      <Shield className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-red-900">
                        {userToDelete.username}
                      </p>
                      <p className="text-sm text-red-700">
                        {userToDelete.email}
                      </p>
                      <Badge className={`${ROLE_COLORS[userToDelete.role]} mt-1`}>
                        {userToDelete.role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="bg-amber-50/50 border border-amber-200/50 rounded-lg p-3">
                  <p className="text-sm text-amber-800 font-medium">
                    ⚠️ Are you absolutely sure you want to delete this user?
                  </p>
                </div>
              </div>
            )}
            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setUserToDelete(null);
                }}
                className="bg-white hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleDeleteUser}
                className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
} 