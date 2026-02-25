'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ExternalLink,
  Copy,
  CheckCheck,
  Rocket,
  Building2,
  Code,
  Phone,
  Key,
  Webhook,
  MessageSquare,
  PartyPopper,
  HelpCircle,
} from 'lucide-react';

interface SetupWizardProps {
  dealerId: string;
  onComplete?: () => void;
}

interface WizardData {
  hasMetaAccount: boolean;
  hasAppCreated: boolean;
  phoneNumberType: 'test' | 'production' | null;
  phoneNumberId: string;
  phoneNumber: string;
  wabaId: string;
  accessToken: string;
  verifyToken: string;
  webhookConfigured: boolean;
  displayName: string;
}

export function SetupWizard({ dealerId, onComplete }: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const t = useTranslations();
  
  const supabase = createClient();
  
  const [data, setData] = useState<WizardData>({
    hasMetaAccount: false,
    hasAppCreated: false,
    phoneNumberType: null,
    phoneNumberId: '',
    phoneNumber: '',
    wabaId: '',
    accessToken: '',
    verifyToken: `dealer-os-${dealerId}-${Math.random().toString(36).substring(7)}`,
    webhookConfigured: false,
    displayName: '',
  });

  const totalSteps = 8;
  const progress = (currentStep / totalSteps) * 100;

  const webhookUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/webhooks/whatsapp` 
    : '';

  const copyToClipboard = async (text: string, type: 'webhook' | 'token') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'webhook') {
        setCopiedWebhook(true);
        setTimeout(() => setCopiedWebhook(false), 2000);
      } else {
        setCopiedToken(true);
        setTimeout(() => setCopiedToken(false), 2000);
      }
      toast.success(t('whatsappSetup.webhook.copied'));
    } catch {
      toast.error(t('whatsappSetup.webhook.copyError'));
    }
  };

  const testToken = async () => {
    if (!data.accessToken || !data.phoneNumberId) {
      toast.error(t('whatsappSetup.accessToken.missingFields'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/whatsapp/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: data.accessToken,
          phoneNumberId: data.phoneNumberId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setTestSuccess(true);
        toast.success(t('whatsappSetup.accessToken.testSuccessToast'));
        
        // Update display name if provided by Meta
        if (result.displayName) {
          setData(prev => ({ ...prev, displayName: result.displayName }));
        }
      } else {
        toast.error(result.error || t('whatsappSetup.accessToken.testError'));
      }
    } catch (error) {
      console.error('Test error:', error);
      toast.error(t('whatsappSetup.accessToken.connectionError'));
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestMessage = async () => {
    if (!data.phoneNumber) {
      toast.error(t('whatsappSetup.testMessage.phoneRequired'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumberId: data.phoneNumberId,
          accessToken: data.accessToken,
          to: data.phoneNumber,
          message: t('whatsappSetup.testMessage.welcomeMessage'),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(t('whatsappSetup.testMessage.sendSuccess'));
      } else {
        toast.error(result.error || t('whatsappSetup.testMessage.sendError'));
      }
    } catch (error) {
      console.error('Send error:', error);
      toast.error(t('whatsappSetup.testMessage.sendError'));
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfiguration = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('whatsapp_connections')
        .upsert({
          dealer_id: dealerId,
          phone_number_id: data.phoneNumberId,
          phone_number: data.phoneNumber,
          waba_id: data.wabaId,
          access_token: data.accessToken,
          verify_token: data.verifyToken,
          display_name: data.displayName,
          status: 'active',
        }, {
          onConflict: 'dealer_id',
        });

      if (error) throw error;

      toast.success(t('whatsappSetup.complete.saveSuccess'));
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error(t('whatsappSetup.complete.saveError'));
    } finally {
      setIsLoading(false);
    }
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return true;
      case 2:
        return data.hasMetaAccount;
      case 3:
        return data.hasAppCreated;
      case 4:
        return data.phoneNumberType !== null && data.phoneNumberId.length > 0;
      case 5:
        return data.accessToken.length > 0 && testSuccess;
      case 6:
        return data.webhookConfigured;
      case 7:
        return true;
      case 8:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (canGoNext()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <Rocket className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                {t('whatsappSetup.welcome.title')}
              </h2>
              <p className="text-lg text-slate-600 mb-6 max-w-2xl mx-auto">
                {t('whatsappSetup.welcome.description')}
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 max-w-xl mx-auto">
                <h3 className="font-semibold text-slate-900 mb-3">{t('whatsappSetup.welcome.benefits.title')}</h3>
                <ul className="text-left space-y-2 text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{t('whatsappSetup.welcome.benefits.directCommunication')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{t('whatsappSetup.welcome.benefits.autoReplies')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{t('whatsappSetup.welcome.benefits.centralManagement')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{t('whatsappSetup.welcome.benefits.professionalProfile')}</span>
                  </li>
                </ul>
              </div>

              <div className="flex items-center justify-center gap-2 text-slate-500">
                <span className="text-sm">{t('whatsappSetup.welcome.estimatedTime')}</span>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{t('whatsappSetup.metaAccount.title')}</h2>
                <p className="text-slate-600">{t('whatsappSetup.metaAccount.description')}</p>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                <div className="space-y-3">
                  <p className="font-medium">{t('whatsappSetup.metaAccount.instructions')}</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>{t('whatsappSetup.metaAccount.steps.1')}</li>
                    <li>{t('whatsappSetup.metaAccount.steps.2')}</li>
                    <li>{t('whatsappSetup.metaAccount.steps.3')}</li>
                    <li>{t('whatsappSetup.metaAccount.steps.4')}</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open('https://business.facebook.com', '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              {t('whatsappSetup.metaAccount.openLink')}
            </Button>

            <div className="border-t pt-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="hasMetaAccount"
                  checked={data.hasMetaAccount}
                  onCheckedChange={(checked) => 
                    setData(prev => ({ ...prev, hasMetaAccount: checked as boolean }))
                  }
                />
                <div className="space-y-1">
                  <label
                    htmlFor="hasMetaAccount"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {t('whatsappSetup.metaAccount.confirm')}
                  </label>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowHelp(!showHelp)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
            >
              <HelpCircle className="h-4 w-4" />
              {t('whatsappSetup.metaAccount.helpTitle')}
            </button>

            {showHelp && (
              <div className="bg-slate-50 border rounded-lg p-4 text-sm text-slate-700">
                <p className="mb-2">
                  <strong>{t('whatsappSetup.metaAccount.helpText1')}</strong>
                </p>
                <p>
                  {t('whatsappSetup.metaAccount.helpText2')}
                </p>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Code className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{t('whatsappSetup.developerApp.title')}</h2>
                <p className="text-slate-600">{t('whatsappSetup.developerApp.description')}</p>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                <div className="space-y-3">
                  <p className="font-medium">{t('whatsappSetup.developerApp.instructions')}</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>{t('whatsappSetup.developerApp.steps.1')}</li>
                    <li>{t('whatsappSetup.developerApp.steps.2')}</li>
                    <li><strong>{t('whatsappSetup.developerApp.steps.3')}</strong></li>
                    <li>{t('whatsappSetup.developerApp.steps.4')}</li>
                    <li><strong>{t('whatsappSetup.developerApp.steps.5')}</strong></li>
                    <li>{t('whatsappSetup.developerApp.steps.6')}</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open('https://developers.facebook.com/apps', '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              {t('whatsappSetup.developerApp.openLink')}
            </Button>

            <div className="border-t pt-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="hasAppCreated"
                  checked={data.hasAppCreated}
                  onCheckedChange={(checked) => 
                    setData(prev => ({ ...prev, hasAppCreated: checked as boolean }))
                  }
                />
                <div className="space-y-1">
                  <label
                    htmlFor="hasAppCreated"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {t('whatsappSetup.developerApp.confirm')}
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{t('whatsappSetup.phoneNumber.title')}</h2>
                <p className="text-slate-600">{t('whatsappSetup.phoneNumber.description')}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div
                onClick={() => setData(prev => ({ ...prev, phoneNumberType: 'test' }))}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  data.phoneNumberType === 'test'
                    ? 'border-green-500 bg-green-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {data.phoneNumberType === 'test' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <div className="h-5 w-5 border-2 border-slate-300 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">
                      {t('whatsappSetup.phoneNumber.optionTest.title')}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {t('whatsappSetup.phoneNumber.optionTest.description')}
                    </p>
                    <Badge variant="outline" className="mt-2">{t('whatsappSetup.phoneNumber.optionTest.badge')}</Badge>
                  </div>
                </div>
              </div>

              <div
                onClick={() => setData(prev => ({ ...prev, phoneNumberType: 'production' }))}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  data.phoneNumberType === 'production'
                    ? 'border-green-500 bg-green-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {data.phoneNumberType === 'production' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <div className="h-5 w-5 border-2 border-slate-300 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">
                      {t('whatsappSetup.phoneNumber.optionProduction.title')}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {t('whatsappSetup.phoneNumber.optionProduction.description')}
                    </p>
                    <Badge variant="outline" className="mt-2">{t('whatsappSetup.phoneNumber.optionProduction.badge')}</Badge>
                  </div>
                </div>
              </div>
            </div>

            {data.phoneNumberType && (
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <Label htmlFor="phoneNumberId">{t('whatsappSetup.phoneNumber.phoneNumberId')}</Label>
                  <Input
                    id="phoneNumberId"
                    placeholder={t('whatsappSetup.phoneNumber.phoneNumberIdPlaceholder')}
                    value={data.phoneNumberId}
                    onChange={(e) => setData(prev => ({ ...prev, phoneNumberId: e.target.value }))}
                    className="mt-1"
                  />
                  <p className="text-sm text-slate-500 mt-1">
                    {t('whatsappSetup.phoneNumber.phoneNumberIdHelp')}
                  </p>
                </div>

                {data.phoneNumberType === 'production' && (
                  <div>
                    <Label htmlFor="phoneNumber">{t('whatsappSetup.phoneNumber.phoneNumber')}</Label>
                    <Input
                      id="phoneNumber"
                      placeholder={t('whatsappSetup.phoneNumber.phoneNumberPlaceholder')}
                      value={data.phoneNumber}
                      onChange={(e) => setData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="wabaId">{t('whatsappSetup.phoneNumber.wabaId')}</Label>
                  <Input
                    id="wabaId"
                    placeholder={t('whatsappSetup.phoneNumber.wabaIdPlaceholder')}
                    value={data.wabaId}
                    onChange={(e) => setData(prev => ({ ...prev, wabaId: e.target.value }))}
                    className="mt-1"
                  />
                  <p className="text-sm text-slate-500 mt-1">
                    {t('whatsappSetup.phoneNumber.wabaIdHelp')}
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Key className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{t('whatsappSetup.accessToken.title')}</h2>
                <p className="text-slate-600">{t('whatsappSetup.accessToken.description')}</p>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                <div className="space-y-3">
                  <p className="font-medium">{t('whatsappSetup.accessToken.instructions')}</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>{t('whatsappSetup.accessToken.steps.1')}</li>
                    <li>{t('whatsappSetup.accessToken.steps.2')}</li>
                    <li>{t('whatsappSetup.accessToken.steps.3')}</li>
                    <li>{t('whatsappSetup.accessToken.steps.4')}</li>
                    <li>{t('whatsappSetup.accessToken.steps.5')}
                      <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                        <li><code className="text-xs bg-slate-100 px-1 py-0.5 rounded">whatsapp_business_management</code></li>
                        <li><code className="text-xs bg-slate-100 px-1 py-0.5 rounded">whatsapp_business_messaging</code></li>
                      </ul>
                    </li>
                    <li>{t('whatsappSetup.accessToken.steps.6')}</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>

            <div>
              <Label htmlFor="accessToken">{t('whatsappSetup.accessToken.tokenLabel')}</Label>
              <Input
                id="accessToken"
                type="password"
                placeholder={t('whatsappSetup.accessToken.tokenPlaceholder')}
                value={data.accessToken}
                onChange={(e) => setData(prev => ({ ...prev, accessToken: e.target.value }))}
                className="mt-1 font-mono text-sm"
              />
              <p className="text-sm text-slate-500 mt-1">
                {t('whatsappSetup.accessToken.tokenHelp')}
              </p>
            </div>

            {data.accessToken && data.phoneNumberId && (
              <Button
                onClick={testToken}
                disabled={isLoading || testSuccess}
                variant={testSuccess ? 'default' : 'outline'}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('whatsappSetup.accessToken.testing')}
                  </>
                ) : testSuccess ? (
                  <>
                    <CheckCheck className="mr-2 h-4 w-4" />
                    {t('whatsappSetup.accessToken.testSuccess')}
                  </>
                ) : (
                  t('whatsappSetup.accessToken.testConnection')
                )}
              </Button>
            )}

            {testSuccess && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {t('whatsappSetup.accessToken.connectionSuccess')}
                </AlertDescription>
              </Alert>
            )}
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <Webhook className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{t('whatsappSetup.webhook.title')}</h2>
                <p className="text-slate-600">{t('whatsappSetup.webhook.description')}</p>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                <p className="font-medium mb-2">{t('whatsappSetup.webhook.copyValues')}</p>
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <Label>{t('whatsappSetup.webhook.webhookUrl')}</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={webhookUrl}
                    readOnly
                    className="font-mono text-sm bg-slate-50"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(webhookUrl, 'webhook')}
                  >
                    {copiedWebhook ? (
                      <CheckCheck className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label>{t('whatsappSetup.webhook.verifyToken')}</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={data.verifyToken}
                    readOnly
                    className="font-mono text-sm bg-slate-50"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(data.verifyToken, 'token')}
                  >
                    {copiedToken ? (
                      <CheckCheck className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                <div className="space-y-3">
                  <p className="font-medium">{t('whatsappSetup.webhook.instructions')}</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>{t('whatsappSetup.webhook.steps.1')}</li>
                    <li>{t('whatsappSetup.webhook.steps.2')}</li>
                    <li>{t('whatsappSetup.webhook.steps.3')}</li>
                    <li><strong>{t('whatsappSetup.webhook.steps.4')}</strong></li>
                    <li><strong>{t('whatsappSetup.webhook.steps.5')}</strong></li>
                    <li>{t('whatsappSetup.webhook.steps.6')}</li>
                    <li>{t('whatsappSetup.webhook.steps.7')}
                      <ul className="list-disc list-inside ml-4 mt-1">
                        <li>{t('whatsappSetup.webhook.webhookFields.messages')}</li>
                        <li>{t('whatsappSetup.webhook.webhookFields.status')}</li>
                      </ul>
                    </li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open('https://developers.facebook.com/apps', '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              {t('whatsappSetup.webhook.openConfig')}
            </Button>

            <div className="border-t pt-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="webhookConfigured"
                  checked={data.webhookConfigured}
                  onCheckedChange={(checked) => 
                    setData(prev => ({ ...prev, webhookConfigured: checked as boolean }))
                  }
                />
                <div className="space-y-1">
                  <label
                    htmlFor="webhookConfigured"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {t('whatsappSetup.webhook.confirm')}
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-pink-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{t('whatsappSetup.testMessage.title')}</h2>
                <p className="text-slate-600">{t('whatsappSetup.testMessage.description')}</p>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                {t('whatsappSetup.testMessage.intro')}
              </AlertDescription>
            </Alert>

            <div>
              <Label htmlFor="testPhoneNumber">{t('whatsappSetup.testMessage.phoneLabel')}</Label>
              <Input
                id="testPhoneNumber"
                placeholder={t('whatsappSetup.testMessage.phonePlaceholder')}
                value={data.phoneNumber}
                onChange={(e) => setData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                className="mt-1"
              />
              <p className="text-sm text-slate-500 mt-1">
                {t('whatsappSetup.testMessage.phoneHelp')}
              </p>
            </div>

            <Button
              onClick={sendTestMessage}
              disabled={isLoading || !data.phoneNumber}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('whatsappSetup.testMessage.sending')}
                </>
              ) : (
                <>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {t('whatsappSetup.testMessage.send')}
                </>
              )}
            </Button>

            <div className="bg-slate-50 border rounded-lg p-4">
              <p className="text-sm text-slate-700">
                <strong>{t('whatsappSetup.testMessage.successNote')}</strong>
              </p>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <PartyPopper className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                {t('whatsappSetup.complete.title')}
              </h2>
              <p className="text-lg text-slate-600 mb-6 max-w-2xl mx-auto">
                {t('whatsappSetup.complete.description')}
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 max-w-xl mx-auto text-left">
                <h3 className="font-semibold text-slate-900 mb-3">{t('whatsappSetup.complete.summaryTitle')}</h3>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span><strong>{t('whatsappSetup.complete.phoneNumber')}</strong> {data.phoneNumber || t('whatsappSetup.complete.testNumber')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span><strong>{t('whatsappSetup.complete.phoneNumberId')}</strong> {data.phoneNumberId}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span><strong>{t('whatsappSetup.complete.wabaId')}</strong> {data.wabaId}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span><strong>{t('whatsappSetup.complete.accessToken')}</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span><strong>{t('whatsappSetup.complete.webhook')}</strong></span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3 max-w-md mx-auto">
                <Button
                  onClick={saveConfiguration}
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('whatsappSetup.complete.saving')}
                    </>
                  ) : (
                    t('whatsappSetup.complete.saveButton')
                  )}
                </Button>

                <p className="text-sm text-slate-500">
                  {t('whatsappSetup.complete.afterSave')}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">
            {t('whatsappSetup.step', { current: currentStep, total: totalSteps })}
          </span>
          <span className="text-sm text-slate-500">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {renderStep()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          {t('whatsappSetup.back')}
        </Button>

        {currentStep < totalSteps && (
          <Button
            onClick={nextStep}
            disabled={!canGoNext()}
          >
            {t('whatsappSetup.next')}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Completed Steps Indicator */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full transition-all ${
              index + 1 < currentStep
                ? 'bg-green-500'
                : index + 1 === currentStep
                ? 'bg-blue-500 w-4'
                : 'bg-slate-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
