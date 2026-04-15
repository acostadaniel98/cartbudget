/**
 * AddProductForm - Molecule
 * Formulario para agregar productos al carrito
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { TextInput } from './TextInput';
import { NumberInput } from './NumberInput';
import { Button } from './Button';
import { useCart } from '@/presentation/hooks/useCart';

interface FormData {
    name: string;
    price: string;
    quantity: string;
}

export const AddProductForm: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        price: '',
        quantity: '',
    });
    const [errors, setErrors] = useState<Partial<FormData>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});
    const { handleAddProduct } = useCart();

    const validateField = useCallback((field: keyof FormData, value: string): string | undefined => {
        switch (field) {
            case 'name': {
                if (!value.trim()) return 'El nombre es requerido';
                if (value.length > 50) return 'Máximo 50 caracteres';
                return undefined;
            }
            case 'price': {
                if (!value) return 'Ingresa el precio';
                const price = parseFloat(value);
                if (isNaN(price)) return 'Debe ser un número';
                if (price <= 0) return 'Debe ser mayor a $0';
                if (price > 999999) return 'Precio muy alto';
                return undefined;
            }
            case 'quantity': {
                if (!value) return 'Ingresa la cantidad';
                const qty = parseInt(value);
                if (isNaN(qty)) return 'Debe ser un número';
                if (qty < 1) return 'Mínimo 1 unidad';
                if (qty > 999) return 'Máximo 999 unidades';
                return undefined;
            }
            default:
                return undefined;
        }
    }, []);

    const validateForm = useCallback((): boolean => {
        const newErrors: Partial<FormData> = {};

        Object.entries(formData).forEach(([key, value]) => {
            const error = validateField(key as keyof FormData, value);
            if (error) {
                newErrors[key as keyof FormData] = error;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, validateField]);

    const handleFieldChange = useCallback((field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Validar en tiempo real si el campo fue tocado
        if (touched[field]) {
            const error = validateField(field, value);
            setErrors(prev => {
                if (error) {
                    return { ...prev, [field]: error };
                } else {
                    const newErrors = { ...prev };
                    delete newErrors[field];
                    return newErrors;
                }
            });
        }
    }, [touched, validateField]);

    const handleFieldBlur = useCallback((field: keyof FormData) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        const error = validateField(field, formData[field]);

        setErrors(prev => {
            if (error) {
                return { ...prev, [field]: error };
            } else {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            }
        });
    }, [formData, validateField]);

    const onSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();

            if (!validateForm()) {
                return;
            }

            setIsSubmitting(true);
            try {
                await handleAddProduct(
                    formData.name.trim(),
                    parseFloat(formData.price),
                    parseInt(formData.quantity)
                );
                setFormData({ name: '', price: '', quantity: '' });
                setErrors({});
                setTouched({});
            } catch (error) {
                console.error('Error:', error);
                setErrors({ name: 'Error al agregar el producto' });
            } finally {
                setIsSubmitting(false);
            }
        },
        [formData, handleAddProduct, validateForm]
    );

    const isFormValid = useMemo(() => {
        return formData.name.trim() !== '' &&
            formData.price !== '' &&
            formData.quantity !== '' &&
            Object.keys(errors).length === 0;
    }, [formData, errors]);

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <TextInput
                label="Nombre del producto"
                placeholder="Ej: Leche, Pan, Manzana"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('name', e.target.value)}
                onBlur={() => handleFieldBlur('name')}
                error={touched.name ? errors.name : undefined}
                helperText="Qué producto vas a comprar"
                maxLength={50}
            />

            <div className="grid grid-cols-2 gap-3">
                <NumberInput
                    label="Precio"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(value) => handleFieldChange('price', value)}
                    onBlur={() => handleFieldBlur('price')}
                    min={0}
                    max={999999}
                    step={0.01}
                    error={touched.price ? errors.price : undefined}
                    helperText="USD"
                />

                <NumberInput
                    label="Cantidad"
                    placeholder="1"
                    value={formData.quantity}
                    onChange={(value) => handleFieldChange('quantity', value)}
                    onBlur={() => handleFieldBlur('quantity')}
                    min={1}
                    max={999}
                    step={1}
                    error={touched.quantity ? errors.quantity : undefined}
                    helperText="unidades"
                />
            </div>

            <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={!isFormValid || isSubmitting}
                size="lg"
                className="w-full"
            >
                {isSubmitting ? 'Agregando...' : 'Agregar producto'}
            </Button>

            {Object.keys(errors).length > 0 && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                    Revisa los campos con error
                </div>
            )}
        </form>
    );
};