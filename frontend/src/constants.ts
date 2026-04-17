import type { Preset } from "./types";

export const DEFAULT_API_URL = import.meta.env.DEFAULT_API_URL;
export const DEFAULT_API_KEY = import.meta.env.DEFAULT_API_KEY;
export const DEFAULT_SESSION_ID = import.meta.env.DEFAULT_SESSION_ID;

export const PRESETS: Preset[] = [
  {
    label: "SBI Account Block",
    category: "Bank Impersonation",
    icon: "🏦",
    messages: [
      "URGENT: Your SBI account has been blocked due to KYC not updated. Call 9876543210 immediately.",
      "Sir we are SBI helpdesk. Please share OTP received on your number to unblock account.",
      "Time is running out sir. Please send OTP 847362 or account will be permanently closed.",
    ],
  },
  {
    label: "UPI Refund Scam",
    category: "Refund Scam",
    icon: "💸",
    messages: [
      "Hello, I am calling from PhonePe support. You are eligible for cashback of ₹5000. Please share UPI PIN to process refund.",
      "Sir please send ₹1 to refund.phonepesupport@ybl to verify your account first.",
      "Transaction ID TXN847362 is pending. Confirm your UPI ID and bank account 9876543210 to receive money.",
    ],
  },
  {
    label: "Lottery / Prize Scam",
    category: "Lottery Scam",
    icon: "🎰",
    messages: [
      "Congratulations! You have won ₹25 Lakh in Lucky Draw 2024. Click http://luckydraw-india.win to claim now.",
      "Your prize claim ID is LD2024-7823. Please transfer ₹2500 processing fee to +91-9988776655.",
      "Sir please send fee to winner.claim@paytm or prize will expire in 2 hours.",
    ],
  },
  {
    label: "Job Offer Scam",
    category: "Job Scam",
    icon: "💼",
    messages: [
      "Hi, We found your resume on Naukri. Work from home job ₹50000/month. Send account details to jobs.verify@fakebank.",
      "Deposit ₹3000 as security to account 1234567890123456 IFSC FAKE0001234 to confirm your joining.",
    ],
  },
  {
    label: "Hindi OTP Fraud",
    category: "OTP Scam",
    icon: "📱",
    messages: [
      "Aapka bank account block hone wala hai, turant OTP bhejiye warna account permanently band ho jayega.",
      "Sir main HDFC bank se bol raha hoon. OTP 637281 share karein account activate karne ke liye.",
    ],
  },
];

export const QUICK_FIRE = [
  "Your account will be closed in 24 hours.",
  "Transfer ₹1 to test.upi@ybl immediately.",
  "Check http://fake-sbi-kyc.in for more details.",
  "Call +91-9988112233 for bank verification.",
];
