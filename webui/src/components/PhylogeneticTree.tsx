import React, { useEffect, useRef, useState } from 'react';
import { Graph } from '@antv/g6';
import { Card, Button, Space, Slider, Switch } from 'antd';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { G6TreeData, parseNewick, convertToG6Format, generateSampleTreeData } from '../utils/newickParser';

interface PhylogeneticTreeProps {
  /** Newick format string or G6 tree data */
  data?: string | G6TreeData;
  /** Width of the tree container */
  width?: number;
  /** Height of the tree container */
  height?: number;
  /** Whether to show controls */
  showControls?: boolean;
  /** Tree layout direction */
  direction?: 'LR' | 'RL' | 'TB' | 'BT' | 'H' | 'V';
  /** Custom node style */
  nodeStyle?: any;
  /** Custom edge style */
  edgeStyle?: any;
  /** Callback when node is clicked */
  onNodeClick?: (node: any) => void;
}

const PhylogeneticTree: React.FC<PhylogeneticTreeProps> = ({
  data,
  width = 800,
  height = 600,
  showControls = true,
  direction = 'LR',
  nodeStyle,
  edgeStyle,
  onNodeClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [showBranchLengths, setShowBranchLengths] = useState(false);

  // Parse and prepare tree data with manual layout
  const layoutTreeData = (treeData: G6TreeData): any => {
    const nodes: any[] = [];
    const edges: any[] = [];

    // Calculate tree dimensions
    function getTreeDepth(node: G6TreeData): number {
      if (!node.children || node.children.length === 0) return 1;
      const depths = node.children.map((child) => getTreeDepth(child));
      return 1 + Math.max(...depths);
    }

    const depth = getTreeDepth(treeData);
    const siblingDistance = 80;
    const levelHeight = 100;

    // Recursive layout function
    function layoutNode(node: G6TreeData, x: number, y: number, siblingSpacing: number): void {
      const nodeData: any = {
        id: node.id,
        label: node.label || node.id,
        x,
        y,
      };
      nodes.push(nodeData);

      if (node.children && node.children.length > 0) {
        const childrenSpacing = siblingSpacing / node.children.length;
        const totalWidth = siblingSpacing;
        const startX = x - totalWidth / 2;

        node.children.forEach((child, idx) => {
          const childX = startX + (idx + 0.5) * childrenSpacing;
          const childY = y + levelHeight;

          layoutNode(child, childX, childY, childrenSpacing);

          edges.push({
            source: node.id,
            target: child.id,
          });
        });
      }
    }

    layoutNode(treeData, 0, 0, siblingDistance * (2 ** (depth - 1)));
    return { nodes, edges };
  };

  // Get tree data
  const getTreeData = (): any => {
    if (!data) {
      return layoutTreeData(generateSampleTreeData());
    }

    if (typeof data === 'string') {
      // Assume Newick format
      const parsedTree = parseNewick(data);
      if (parsedTree) {
        return layoutTreeData(convertToG6Format(parsedTree));
      }
      return layoutTreeData(generateSampleTreeData());
    }

    return layoutTreeData(data);
  };

  const initializeGraph = () => {
    if (!containerRef.current) return;

    // Clear existing graph
    if (graphRef.current) {
      graphRef.current.destroy();
    }

    // Map direction to G6 format
    const getLayoutDirection = (dir: string): string => {
      switch (dir) {
        case 'LR':
          return 'LR';
        case 'RL':
          return 'RL';
        case 'TB':
          return 'TB';
        default:
          return 'BT';
      }
    };

    // Layout direction for future use
    getLayoutDirection(direction);

    const graph = new Graph({
      container: containerRef.current,
      width,
      height,
      modes: {
        default: ['drag-canvas', 'zoom-canvas', 'drag-node'],
      },
      defaultNode: {
        type: 'circle',
        size: 12,
        style: {
          fill: '#1890ff',
          stroke: '#ffffff',
          lineWidth: 2,
          ...nodeStyle,
        },
        labelCfg: {
          position: 'right',
          offset: 8,
          style: {
            fontSize: 12,
            fill: '#333',
            textAlign: 'left',
            textBaseline: 'middle',
          },
        },
      },
      defaultEdge: {
        type: 'polyline',
        style: {
          stroke: '#666',
          lineWidth: 1.5,
          endArrow: false,
          radius: 10,
          ...edgeStyle,
        },
        labelCfg: {
          style: {
            fontSize: 10,
            fill: '#666',
          },
        },
      },
      nodeStateStyles: {
        hover: {
          fill: '#ff7f0e',
          stroke: '#ffffff',
          lineWidth: 3,
        },
        selected: {
          fill: '#ff4d4f',
          stroke: '#ffffff',
          lineWidth: 3,
        },
      },
      edgeStateStyles: {
        hover: {
          stroke: '#ff7f0e',
          lineWidth: 2,
        },
      },
    });

    // Add event listeners
    graph.on('node:mouseenter', (evt) => {
      const { item } = evt;
      graph.setItemState(item!, 'hover', true);
    });

    graph.on('node:mouseleave', (evt) => {
      const { item } = evt;
      graph.setItemState(item!, 'hover', false);
    });

    graph.on('node:click', (evt) => {
      const { item } = evt;
      const model = item!.getModel();

      // Clear previous selection
      graph.getNodes().forEach((node) => {
        graph.clearItemStates(node, 'selected');
      });

      // Set current selection
      graph.setItemState(item!, 'selected', true);

      if (onNodeClick) {
        onNodeClick(model);
      }
    });

    // Load data and render
    const graphData = getTreeData();
    graph.data(graphData);
    graph.render();

    // Fit to viewport after rendering
    setTimeout(() => {
      graph.fitView(20);
      setZoom(graph.getZoom());
    }, 100);

    graphRef.current = graph;
    setZoom(graph.getZoom());
  };

  useEffect(() => {
    initializeGraph();

    return () => {
      if (graphRef.current) {
        graphRef.current.destroy();
      }
    };
  }, [data, direction, width, height]);

  // Update node labels visibility
  useEffect(() => {
    if (!graphRef.current) return;

    const nodes = graphRef.current.getNodes();
    nodes.forEach((node) => {
      const model = node.getModel();
      graphRef.current!.updateItem(node, {
        ...model,
        label: showLabels ? model.label : '',
      });
    });
  }, [showLabels]);

  // Control functions
  const handleZoomIn = () => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.getZoom();
      const newZoom = Math.min(currentZoom * 1.2, 3);
      graphRef.current.zoomTo(newZoom);
      setZoom(newZoom);
    }
  };

  const handleZoomOut = () => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.getZoom();
      const newZoom = Math.max(currentZoom * 0.8, 0.1);
      graphRef.current.zoomTo(newZoom);
      setZoom(newZoom);
    }
  };

  const handleFitView = () => {
    if (graphRef.current) {
      graphRef.current.fitView(20); // Add padding
      setZoom(graphRef.current.getZoom());
    }
  };

  const handleReset = () => {
    initializeGraph();
  };

  const handleDownload = () => {
    if (graphRef.current) {
      const canvas = graphRef.current.get('canvas');
      const renderer = canvas.get('renderer');
      const canvasElement = renderer.get('canvas');

      if (canvasElement) {
        const dataURL = canvasElement.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'phylogenetic-tree.png';
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  const handleZoomChange = (value: number) => {
    if (graphRef.current) {
      graphRef.current.zoomTo(value);
      setZoom(value);
    }
  };

  return (
    <Card
      title="Phylogenetic Tree"
      style={{ width: '100%' }}
      extra={
        showControls && (
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleReset} size="small">
              Reset
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleDownload} size="small">
              Download
            </Button>
          </Space>
        )
      }
    >
      {showControls && (
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Space>
              <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut} size="small" />
              <Slider
                min={0.1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={handleZoomChange}
                style={{ width: 100 }}
              />
              <Button icon={<ZoomInOutlined />} onClick={handleZoomIn} size="small" />
            </Space>
            <Button icon={<FullscreenOutlined />} onClick={handleFitView} size="small">
              Fit View
            </Button>
            <Space>
              <span>Labels:</span>
              <Switch
                checked={showLabels}
                onChange={setShowLabels}
                size="small"
              />
            </Space>
            <Space>
              <span>Branch Lengths:</span>
              <Switch
                checked={showBranchLengths}
                onChange={setShowBranchLengths}
                size="small"
              />
            </Space>
          </Space>
        </div>
      )}

      <div
        ref={containerRef}
        style={{
          width,
          height,
          border: '1px solid #d9d9d9',
          borderRadius: 6,
          overflow: 'hidden',
        }}
      />

      <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
        Use mouse wheel to zoom, drag to pan, click nodes to select
      </div>
    </Card>
  );
};

export { PhylogeneticTree };
