import React, { useState, useEffect } from 'react';
import {
  Card,
  Upload,
  Select,
  Button,
  Typography,
  Space,
  Alert,
  Table,
  Collapse,
  Form,
  InputNumber,
  message,
  Divider,
} from 'antd';
import { InboxOutlined, PlayCircleOutlined } from '@ant-design/icons';
import type { UploadProps, UploadFile } from 'antd';
import { MethodInfo, SequenceData, AnalysisResponse, DSSApiClient } from '../services/dssApi';
import { PhylogeneticTree } from '../components/PhylogeneticTree';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;
const { Panel } = Collapse;

export const DSAAnalysis: React.FC = () => {
  const [methods, setMethods] = useState<MethodInfo[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [sequenceData, setSequenceData] = useState<SequenceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResponse | null>(null);
  const [form] = Form.useForm();

  const loadMethods = async () => {
    try {
      setLoading(true);
      const methodList = await DSSApiClient.getMethods();
      setMethods(methodList);
      if (methodList.length > 0) {
        setSelectedMethod(methodList[0].name);
      }
    } catch (error) {
      message.error('Failed to load analysis methods');
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMethods();
  }, []);

  const uploadProps: UploadProps = {
    multiple: true,
    accept: '.fasta,.fa,.fas,.zip',
    beforeUpload: (file) => {
      setUploadedFiles((prev) => [...prev, file]);
      return false; // Prevent auto upload
    },
    onRemove: (file: UploadFile) => {
      setUploadedFiles((prev) => prev.filter((f) => f.name !== file.name));
      setSequenceData([]);
    },
  };

  const parseUploadedFiles = async () => {
    if (uploadedFiles.length === 0) {
      message.warning('Please upload sequence files first');
      return;
    }

    try {
      setLoading(true);
      const sequences = await DSSApiClient.uploadAndParse(uploadedFiles);
      setSequenceData(sequences);
      message.success(`Parsed ${sequences.length} sequences`);
    } catch (error) {
      message.error('Failed to parse uploaded files');
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    if (uploadedFiles.length === 0) {
      message.warning('Please upload sequence files first');
      return;
    }

    if (!selectedMethod) {
      message.warning('Please select an analysis method');
      return;
    }

    try {
      setAnalyzing(true);
      const formValues = form.getFieldsValue();

      // Prepare files for analysis
      const sequenceFiles = await DSSApiClient.prepareFilesForAnalysis(uploadedFiles);

      const analysisRequest = {
        files: sequenceFiles,
        method: selectedMethod,
        parameters: formValues,
      };

      const result = await DSSApiClient.analyzeSequences(analysisRequest);
      setResults(result);
      const execTime = result.execution_time?.toFixed(2);
      message.success(`Analysis completed in ${execTime}s`);
      // eslint-disable-next-line no-console
    } catch (error) {
      message.error(`Analysis failed: ${(error as Error).message}`);
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  const selectedMethodInfo = methods.find((m) => m.name === selectedMethod);

  const sequenceColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Length',
      dataIndex: 'length',
      key: 'length',
      width: 80,
    },
    {
      title: 'Preview',
      dataIndex: 'sequence',
      key: 'sequence',
      render: (text: string) => (
        <Text code style={{ fontSize: '11px' }}>
          {text.length > 30 ? `${text.substring(0, 30)}...` : text}
        </Text>
      ),
      ellipsis: true,
    },
  ];

  return (
    <div style={{ 
      padding: 'clamp(0.75rem, 4vw, 1.5rem)', 
      maxWidth: '1200px', 
      margin: '0 auto',
      width: '100%',
    }}>
      <Title level={2} style={{ marginBottom: '0.5rem' }}>DNA Sequence Analysis</Title>
      <Paragraph style={{ marginBottom: '1.5rem', color: '#64748b' }}>
        Upload FASTA files or ZIP archives containing sequence data for phylogenetic analysis.
      </Paragraph>

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* File Upload */}
        <Card 
          title={<span style={{ fontSize: '1rem', fontWeight: 600 }}>Upload Sequence Files</span>}
          size="small"
          styles={{ body: { padding: 0 } }}
        >
          <Dragger 
            {...uploadProps}
            style={{ padding: '1rem' }}
          >
            <p className="ant-upload-drag-icon" style={{ fontSize: '2rem', color: '#3b82f6', marginBottom: '0.5rem' }}>
              <InboxOutlined />
            </p>
            <p className="ant-upload-text" style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>
              Click or drag files to upload
            </p>
            <p className="ant-upload-hint" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              FASTA (.fasta, .fa, .fas) and ZIP archives
            </p>
          </Dragger>

          {uploadedFiles.length > 0 && (
            <div style={{ padding: '1rem', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <Text type="secondary">{uploadedFiles.length} file(s) uploaded</Text>
                <Button onClick={parseUploadedFiles} loading={loading} size="small">
                  Parse Files
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Sequence Preview */}
        {sequenceData.length > 0 && (
          <Card 
            title={<span style={{ fontSize: '1rem', fontWeight: 600 }}>Parsed Sequences ({sequenceData.length})</span>}
            size="small"
          >
            <Table
              dataSource={sequenceData}
              columns={sequenceColumns}
              rowKey="name"
              size="small"
              pagination={{ pageSize: 5, size: 'small' }}
              scroll={{ x: true }}
            />
          </Card>
        )}

        {/* Method Selection */}
        <Card 
          title={<span style={{ fontSize: '1rem', fontWeight: 600 }}>Analysis Configuration</span>}
          size="small"
        >
          <Form form={form} layout="vertical">
            <Form.Item 
              label={<span style={{ fontWeight: 500 }}>Analysis Method</span>}
              style={{ marginBottom: '1rem' }}
            >
              <Select
                value={selectedMethod}
                onChange={setSelectedMethod}
                loading={loading}
                style={{ width: '100%' }}
                size="middle"
              >
                {methods.map((method) => (
                  <Select.Option key={method.name} value={method.name}>
                    {method.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {selectedMethodInfo && (
              <Collapse 
                ghost
                size="small"
                items={[
                  {
                    key: 'params',
                    label: <span style={{ color: '#64748b' }}>Method Parameters</span>,
                    children: (
                      <>
                        <Paragraph type="secondary" style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                          {selectedMethodInfo.description}
                        </Paragraph>
                        <Divider style={{ margin: '1rem 0' }} />

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                          {Object.entries(selectedMethodInfo.parameters).map(([key, defaultValue]) => (
                            <Form.Item
                              key={key}
                              name={key}
                              label={<span style={{ fontSize: '0.8rem', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</span>}
                              initialValue={defaultValue}
                              style={{ marginBottom: '0.5rem' }}
                            >
                              {typeof defaultValue === 'number' ? (
                                <InputNumber style={{ width: '100%' }} size="small" />
                              ) : (
                                <Select style={{ width: '100%' }} size="small">
                                  <Select.Option value={defaultValue}>{String(defaultValue)}</Select.Option>
                                </Select>
                              )}
                            </Form.Item>
                          ))}
                        </div>
                      </>
                    ),
                  },
                ]}
              />
            )}
          </Form>
        </Card>

        {/* Analysis Button */}
        <Button
          type="primary"
          size="large"
          icon={<PlayCircleOutlined />}
          onClick={runAnalysis}
          loading={analyzing}
          disabled={uploadedFiles.length === 0}
          style={{ 
            width: '100%', 
            height: '3rem',
            fontSize: '1rem',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            border: 'none',
          }}
        >
          {analyzing ? 'Running Analysis...' : 'Start Analysis'}
        </Button>

        {/* Results */}
        {results && (
          <Card 
            title={<span style={{ fontSize: '1rem', fontWeight: 600 }}>Analysis Results</span>}
            size="small"
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Alert
                message="Analysis Completed Successfully"
                description={`Processed ${results.sequence_names.length} sequences in ${results.execution_time?.toFixed(2)}s`}
                type="success"
                showIcon
              />

              {/* Phylogenetic Tree Visualization */}
              {results.tree_newick && (
                <div style={{ overflow: 'auto', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.5rem' }}>
                  <PhylogeneticTree
                    data={results.tree_newick}
                    width={Math.min(800, window.innerWidth - 100)}
                    height={Math.min(400, window.innerHeight * 0.4)}
                    showControls
                    direction="LR"
                    onNodeClick={(node) => {
                      // eslint-disable-next-line no-console
                      console.log('Node clicked:', node);
                      message.info(`Selected: ${node.label || node.id}`);
                    }}
                  />
                </div>
              )}

              <Collapse 
                ghost 
                size="small"
                items={[
                  {
                    key: 'tree',
                    label: 'Phylogenetic Tree (Newick Format)',
                    children: (
                      <Text code style={{ fontSize: '11px', wordBreak: 'break-all', display: 'block' }}>
                        {results.tree_newick}
                      </Text>
                    ),
                  },
                  {
                    key: 'matrix',
                    label: 'Distance Matrix',
                    children: (
                      <div style={{ overflow: 'auto' }}>
                        <Table
                          dataSource={results.distance_matrix?.map((row, i) => ({
                            key: i,
                            sequence: results.sequence_names[i],
                            ...row.reduce((acc, val, j) => ({ ...acc, [`dist_${j}`]: val.toFixed(4) }), {}),
                          }))}
                          columns={[
                            { title: 'Seq', dataIndex: 'sequence', key: 'sequence', fixed: 'left', width: 100 },
                            ...results.sequence_names.map((name, i) => ({
                              title: name.length > 8 ? `${name.substring(0, 8)}...` : name,
                              dataIndex: `dist_${i}`,
                              key: `dist_${i}`,
                              width: 70,
                            })),
                          ]}
                          scroll={{ x: true }}
                          size="small"
                          pagination={false}
                        />
                      </div>
                    ),
                  },
                ]}
              />
            </Space>
          </Card>
        )}
      </Space>
    </div>
  );
};
