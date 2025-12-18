import { LucideIcon } from 'lucide-react';
import { Card } from '../common';

interface StatsCardProps {
    icon: LucideIcon;
    label: string;
    value: number | string;
    color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo';
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export default function StatsCard({ icon: Icon, label, value, color, trend }: StatsCardProps) {
    const colorClasses = {
        blue: {
            gradient: 'from-blue-500 to-blue-600',
            light: 'text-blue-100',
            icon: 'text-blue-200',
        },
        green: {
            gradient: 'from-green-500 to-green-600',
            light: 'text-green-100',
            icon: 'text-green-200',
        },
        purple: {
            gradient: 'from-purple-500 to-purple-600',
            light: 'text-purple-100',
            icon: 'text-purple-200',
        },
        orange: {
            gradient: 'from-orange-500 to-orange-600',
            light: 'text-orange-100',
            icon: 'text-orange-200',
        },
        red: {
            gradient: 'from-red-500 to-red-600',
            light: 'text-red-100',
            icon: 'text-red-200',
        },
        indigo: {
            gradient: 'from-indigo-500 to-indigo-600',
            light: 'text-indigo-100',
            icon: 'text-indigo-200',
        },
    };

    const colors = colorClasses[color];

    return (
        <Card className={`bg-gradient-to-br ${colors.gradient} text-white overflow-hidden relative group hover:shadow-2xl transition-all duration-300`}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-repeat" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <p className={`${colors.light} text-sm font-medium mb-2`}>{label}</p>
                        <p className="text-4xl font-bold mb-1 group-hover:scale-110 transition-transform origin-left">
                            {typeof value === 'number' ? value.toLocaleString('vi-VN') : value}
                        </p>
                        {trend && (
                            <div className={`flex items-center gap-1 text-xs ${colors.light} mt-2`}>
                                <span className={trend.isPositive ? 'text-green-200' : 'text-red-200'}>
                                    {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                                </span>
                                <span>so với tháng trước</span>
                            </div>
                        )}
                    </div>
                    <Icon className={`w-14 h-14 ${colors.icon} group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`} />
                </div>
            </div>

            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 group-hover:translate-x-full transition-all duration-1000" />
        </Card>
    );
}
