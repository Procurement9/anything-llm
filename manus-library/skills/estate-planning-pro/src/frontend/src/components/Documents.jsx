import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Download, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../lib/api';

const Documents = () => {
  const [availableDocuments, setAvailableDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatingDoc, setGeneratingDoc] = useState(null);

  useEffect(() => {
    fetchAvailableDocuments();
  }, []);

  const fetchAvailableDocuments = async () => {
    try {
      const response = await api.get('/documents/list');
      setAvailableDocuments(response.data.documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const generateDocument = async (docType) => {
    setGeneratingDoc(docType);
    setLoading(true);

    try {
      const response = await api.post(`/documents/${docType.replace('_', '-')}`, {}, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `${docType}.pdf`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error generating document:', error);
      alert('Error generating document. Please try again.');
    } finally {
      setLoading(false);
      setGeneratingDoc(null);
    }
  };

  const getDocumentIcon = (type) => {
    return <FileText className="h-6 w-6" />;
  };

  const getDocumentStatus = (type) => {
    // In a real app, this would check if the document has been generated before
    return 'available';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <p className="text-gray-600">Generate legal documents and reports for your estate plan</p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> These documents are templates for informational purposes only. 
          Please consult with a qualified attorney before using any legal documents.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {availableDocuments.map((doc) => (
          <Card key={doc.type} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getDocumentIcon(doc.type)}
                  <div>
                    <CardTitle className="text-lg">{doc.name}</CardTitle>
                  </div>
                </div>
                <Badge variant={getDocumentStatus(doc.type) === 'available' ? 'default' : 'secondary'}>
                  {getDocumentStatus(doc.type) === 'available' ? 'Available' : 'Draft'}
                </Badge>
              </div>
              <CardDescription>{doc.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => generateDocument(doc.type)}
                disabled={loading}
                className="w-full"
                variant={getDocumentStatus(doc.type) === 'available' ? 'default' : 'outline'}
              >
                {generatingDoc === doc.type ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Generate PDF
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {availableDocuments.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No documents available. Please check back later.</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Document Information</CardTitle>
          <CardDescription>
            Important information about generated documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Legal Templates</p>
                <p className="text-sm text-muted-foreground">
                  Documents are based on standard legal templates but should be reviewed by an attorney.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Personalized Content</p>
                <p className="text-sm text-muted-foreground">
                  Documents are automatically populated with your estate planning data.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="font-medium">Professional Review Required</p>
                <p className="text-sm text-muted-foreground">
                  All legal documents should be reviewed and executed with proper legal counsel.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>
            Recommended actions after generating documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">1</span>
              <span>Review all generated documents carefully</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">2</span>
              <span>Consult with a qualified estate planning attorney</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">3</span>
              <span>Make necessary customizations based on your specific needs</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">4</span>
              <span>Execute documents with proper witnesses and notarization</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">5</span>
              <span>Store original documents in a secure location</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Documents;

