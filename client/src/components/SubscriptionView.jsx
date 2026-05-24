import { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  CreditCard,
  CheckCircle2,
  Zap,
  Crown,
  Star,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { getTeamTheme } from "../utils/theme";

export default function SubscriptionView() {
  const { user } = useApp();
  const theme = getTeamTheme();

  const [selectedPlan, setSelectedPlan] = useState(user?.subscription?.plan || "Free");
  const [isUpgrading, setIsUpgrading] = useState(false);

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      icon: Star,
      features: [
        "Up to 5 team members",
        "Basic standup tracking",
        "7-day history retention",
        "Email notifications",
        "1 team workspace"
      ]
    },
    {
      name: "Pro",
      price: "$19",
      period: "per user/month",
      popular: true,
      icon: Zap,
      features: [
        "Up to 25 team members",
        "Advanced analytics & insights",
        "90-day history retention",
        "Slack integration",
        "Custom standup questions",
        "AI-powered summaries",
        "5 team workspaces"
      ]
    },
    {
      name: "Enterprise",
      price: "$49",
      period: "per user/month",
      icon: Crown,
      features: [
        "Unlimited team members",
        "Full analytics suite",
        "Unlimited history retention",
        "Priority support",
        "SSO & advanced security",
        "Custom integrations",
        "Unlimited workspaces",
        "API access"
      ]
    }
  ];

  const handleUpgrade = async (plan) => {
    setIsUpgrading(true);
    setTimeout(() => {
      setSelectedPlan(plan);
      setIsUpgrading(false);
    }, 1500);
  };

  return (
    <div className="flex-1 p-8 space-y-8 bg-[#0c0d10] overflow-y-auto">
      <div className="border-b border-gray-800 pb-5">
        <h2 className="text-3xl font-sans font-bold text-white tracking-tight leading-none mb-1">
          My Plan
        </h2>
        <p className="text-sm font-sans text-gray-400 mt-1">
          Manage your subscription, view billing details, and upgrade your plan.
        </p>
      </div>

      <div className="bg-[#16191f] p-6 border border-gray-800 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`h-12 w-12 rounded-xl ${theme.bgAccent} flex items-center justify-center`}>
              <CreditCard className={`h-6 w-6 ${theme.textAccent}`} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-sans">Current Plan: {user?.subscription?.plan || "Free"}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                  user?.subscription?.status === "Active"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                }`}>
                  {user?.subscription?.status || "Active"}
                </span>
                <span className="text-xs text-gray-500">
                  {user?.subscription?.billingCycle || "Monthly"} billing
                </span>
              </div>
            </div>
          </div>
          {user?.subscription?.nextBillingDate && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Next billing date</p>
              <p className="text-sm font-mono text-white">{user.subscription.nextBillingDate}</p>
            </div>
          )}
        </div>

        {user?.subscription?.paymentMethod && (
          <div className="mt-4 pt-4 border-t border-gray-800">
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <CreditCard className="h-4 w-4" />
              <span>Payment method: {user.subscription.paymentMethod}</span>
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xl font-bold text-white font-sans mb-4">Upgrade Your Plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingPlans.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.name;
            const isCurrentPlan = user?.subscription?.plan === plan.name;

            return (
              <div
                key={plan.name}
                className={`relative p-6 rounded-2xl border-2 transition-all ${
                  plan.popular
                    ? "border-emerald-500/50 bg-[#16191f]"
                    : isSelected
                    ? `${theme.borderAccent} bg-[#16191f]`
                    : "border-gray-800 bg-[#16191f]/50"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="flex items-center space-x-3 mb-4">
                  <div className={`h-10 w-10 rounded-lg ${plan.popular ? "bg-emerald-500/20" : theme.bgAccent} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${plan.popular ? "text-emerald-400" : theme.textAccent}`} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white font-sans">{plan.name}</h4>
                    <p className="text-2xl font-bold text-white font-mono">
                      {plan.price}
                      <span className="text-sm text-gray-500 font-sans font-normal">/{plan.period}</span>
                    </p>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-xs text-gray-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan.name)}
                  disabled={isUpgrading || isCurrentPlan}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isCurrentPlan
                      ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                      : plan.popular
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                      : `${theme.bgAccent} hover:${theme.bgAccentHover} text-white`
                  }`}
                >
                  {isCurrentPlan ? "Current Plan" : isUpgrading ? "Processing..." : "Upgrade"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-xs text-gray-300">
          <p className="font-semibold text-amber-400 mb-1">Demo Mode</p>
          <p>This is a mock subscription page for demonstration purposes. No actual payments will be processed. In a production environment, this would integrate with a payment gateway like Stripe.</p>
        </div>
      </div>
    </div>
  );
}
