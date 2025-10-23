import React from 'react';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import InputError from '@/Components/InputError';

export default function CategoryForm({ data, setData, errors }) {
    return (
        <div className="grid gap-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="name" className="text-left">
                    Category Name
                </Label>
                <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className="col-span-3"
                    autoFocus
                />
                <InputError message={errors.name} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="description" className="text-left">
                    Description (Optional)
                </Label>
                <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    className="col-span-3"
                />
                <InputError message={errors.description} />
            </div>
        </div>
    );
}