/**
 * Reusable card components for different ingestion types.
 * Used in candidate profile for adding external data sources.
 */

import { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { X, Plus, Upload, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

/**
 * LinkInputCard - For entering URLs/links (GitHub, LinkedIn, etc.)
 */
interface LinkInputCardProps {
  title: string;
  placeholder: string;
  icon?: any;
  onSubmit: (url: string) => Promise<void>;
  onError?: (error: string) => void;
}

export function LinkInputCard({
  title,
  placeholder,
  icon: Icon,
  onSubmit,
  onError,
}: LinkInputCardProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      onError?.('Please enter a URL');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Add https:// prefix if not present
      const formattedUrl = url.trim();
      const finalUrl = formattedUrl.startsWith('https://') ? formattedUrl : `https://${formattedUrl}`;
      
      await onSubmit(finalUrl);
      setSuccess(true);
      setUrl('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError(error.message || 'An error occurred');
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="flex items-end gap-3">
      {Icon && (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1">
        <p className="text-sm font-medium mb-1">{title}</p>
        <Input
          placeholder={placeholder}
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError(null);
          }}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
      </div>
      <Button
        size="sm"
        onClick={handleSubmit}
        disabled={isLoading || !url.trim()}
        className="whitespace-nowrap"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            Adding...
          </>
        ) : success ? (
          <>
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Added
          </>
        ) : (
          <>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </>
        )}
      </Button>
      {error && (
        <div className="text-xs text-red-600 absolute bottom-0 left-0 mt-1">
          {error}
        </div>
      )}
    </div>
  );
}

/**
 * MultiLinkInputCard - For entering multiple URLs (e.g., CP profiles)
 */
interface MultiLinkInputCardProps {
  title: string;
  placeholder: string;
  items: Array<{ label: string; placeholder: string }>;
  onSubmit: (urls: string[]) => Promise<void>;
  onError?: (error: string) => void;
}

export function MultiLinkInputCard({
  title,
  placeholder,
  items,
  onSubmit,
  onError,
}: MultiLinkInputCardProps) {
  const [values, setValues] = useState<Record<string, string>>(
    items.reduce((acc, item) => ({ ...acc, [item.label]: '' }), {})
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    const urls = Object.values(values).filter((v) => v.trim());

    if (urls.length === 0) {
      setError('Please enter at least one URL');
      onError?.('Please enter at least one URL');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await onSubmit(urls);
      setSuccess(true);
      setValues(items.reduce((acc, item) => ({ ...acc, [item.label]: '' }), {}));
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to submit';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium mb-3">{title}</p>
        {items.map((item) => (
          <Input
            key={item.label}
            placeholder={item.placeholder}
            value={values[item.label]}
            onChange={(e) =>
              setValues((prev) => ({
                ...prev,
                [item.label]: e.target.value,
              }))
            }
            disabled={isLoading}
            className="mb-2"
          />
        ))}
      </div>
      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 border border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      <Button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Adding...
          </>
        ) : success ? (
          <>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Added Successfully
          </>
        ) : (
          <>
            <Plus className="h-4 w-4 mr-2" />
            Add Profiles
          </>
        )}
      </Button>
    </div>
  );
}

/**
 * FileUploadCard - For uploading documents/proof of work
 */
interface FileUploadCardProps {
  title: string;
  description?: string;
  acceptedFormats: string[];
  multiple?: boolean;
  onSubmit: (files: File[]) => Promise<void>;
  onError?: (error: string) => void;
}

export function FileUploadCard({
  title,
  description,
  acceptedFormats,
  multiple = true,
  onSubmit,
  onError,
}: FileUploadCardProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const addFiles = (newFiles: File[]) => {
    const validated = newFiles.filter((file) => {
      const ext = `.${file.name.split('.').pop()?.toLowerCase()}`;
      if (!acceptedFormats.includes(ext)) {
        setError(`${file.name} has unsupported format`);
        onError?.(`${file.name} has unsupported format`);
        return false;
      }
      return true;
    });

    setError(null);
    if (!multiple) {
      setFiles(validated.slice(0, 1));
    } else {
      setFiles((prev) => [...prev, ...validated]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      setError('Please select at least one file');
      onError?.('Please select at least one file');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await onSubmit(files);
      setSuccess(true);
      setFiles([]);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to upload';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-border bg-muted/30'
        }`}
      >
        <div className="flex justify-center mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Upload className="h-6 w-6 text-primary" />
          </div>
        </div>
        <p className="font-medium mb-1">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
        )}
        <p className="text-xs text-muted-foreground mb-4">
          Supported formats: {acceptedFormats.join(', ').toUpperCase()}
        </p>
        <label className="cursor-pointer">
          <Button variant="outline" size="sm">
            Choose Files
          </Button>
          <input
            type="file"
            multiple={multiple}
            accept={acceptedFormats.join(',')}
            onChange={handleFileInputChange}
            className="hidden"
            disabled={isLoading}
          />
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Selected Files ({files.length})
          </p>
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 rounded-lg border border-border p-3 bg-card"
            >
              <Upload className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <button
                onClick={() => removeFile(index)}
                disabled={isLoading}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 border border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {files.length > 0 && (
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : success ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Uploaded Successfully
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload {files.length} File{files.length !== 1 ? 's' : ''}
            </>
          )}
        </Button>
      )}
    </div>
  );
}
