import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { 
  Terminal, 
  Send, 
  History, 
  Copy, 
  Trash2, 
  Download,
  ChevronRight,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  Server
} from 'lucide-react';
import axios from 'axios';

const ProModeConsole = ({ isOpen, onClose, wallet }) => {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isConnected, setIsConnected] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const outputRef = useRef(null);
  const inputRef = useRef(null);

  // Predefined RPC commands for Raptoreum
  const RAPTOREUM_COMMANDS = {
    // Blockchain Info
    'getblockchaininfo': 'Get blockchain information',
    'getblockcount': 'Get current block count',
    'getbestblockhash': 'Get hash of best block',
    'getdifficulty': 'Get current difficulty',
    'getnetworkhashps': 'Get network hash rate',
    
    // Wallet Commands
    'getwalletinfo': 'Get wallet information',
    'getbalance': 'Get wallet balance',
    'getnewaddress': 'Generate new address',
    'listaddresses': 'List all wallet addresses',
    'listtransactions': 'List recent transactions',
    'listunspent': 'List unspent outputs',
    
    // Asset Commands
    'listassets': 'List all assets',
    'getassetdata': 'Get asset information',
    'createasset': 'Create new asset',
    'mintasset': 'Mint additional asset units',
    'sendasset': 'Send asset to address',
    'listassetsbalance': 'List asset balances',
    'listunspentassets': 'List unspent asset outputs',
    
    // Network Commands
    'getpeerinfo': 'Get connected peer information',
    'getnetworkinfo': 'Get network information',
    'ping': 'Ping all connected nodes',
    
    // Smartnode Commands
    'smartnode list': 'List all smartnodes',
    'smartnode status': 'Get smartnode status',
    'smartnode create': 'Create smartnode configuration',
    'smartnode start': 'Start smartnode',
    'smartnode stop': 'Stop smartnode',
    
    // Mining Commands
    'getmininginfo': 'Get mining information',
    'getmempoolinfo': 'Get mempool information',
    'getrawtransaction': 'Get raw transaction data',
    
    // Debug Commands
    'help': 'List all available commands',
    'uptime': 'Get node uptime',
    'getconnectioncount': 'Get number of connections'
  };

  useEffect(() => {
    if (isOpen) {
      checkConnection();
      addWelcomeMessage();
      // Focus input when dialog opens
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    // Auto-scroll to bottom when new output is added
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const checkConnection = async () => {
    try {
      const response = await axios.get('/api/raptoreum/connection-status');
      setIsConnected(response.data.connected);
    } catch (error) {
      console.error('Connection check failed:', error);
      setIsConnected(false);
    }
  };

  const addWelcomeMessage = () => {
    setOutput([
      {
        type: 'system',
        timestamp: new Date(),
        content: `RaptorQ Pro Console v1.0.0
Connected to Raptoreum Core
Type 'help' for available commands or use Tab completion.
`
      }
    ]);
  };

  const executeCommand = async () => {
    if (!command.trim()) return;

    const cmd = command.trim();
    const timestamp = new Date();

    // Add command to output
    const commandOutput = {
      type: 'command',
      timestamp,
      content: `> ${cmd}`
    };

    setOutput(prev => [...prev, commandOutput]);
    
    // Add to history
    setHistory(prev => [cmd, ...prev.slice(0, 99)]); // Keep last 100 commands
    setHistoryIndex(-1);
    
    // Clear input
    setCommand('');
    setIsExecuting(true);

    try {
      let result;

      // Handle built-in commands
      if (cmd.toLowerCase() === 'clear') {
        setOutput([]);
        setIsExecuting(false);
        return;
      }

      if (cmd.toLowerCase() === 'help') {
        result = generateHelpOutput();
      } else if (cmd.toLowerCase().startsWith('help ')) {
        const helpCmd = cmd.substring(5);
        result = generateCommandHelp(helpCmd);
      } else {
        // Execute RPC command
        result = await executeRPCCommand(cmd);
      }

      // Add result to output
      const resultOutput = {
        type: result.success ? 'success' : 'error',
        timestamp: new Date(),
        content: result.output
      };

      setOutput(prev => [...prev, resultOutput]);

    } catch (error) {
      console.error('Command execution failed:', error);
      const errorOutput = {
        type: 'error',
        timestamp: new Date(),
        content: `Error: ${error.message || 'Command execution failed'}`
      };
      setOutput(prev => [...prev, errorOutput]);
    } finally {
      setIsExecuting(false);
    }
  };

  const executeRPCCommand = async (cmd) => {
    try {
      const response = await axios.post('/api/raptoreum/rpc', {
        command: cmd,
        wallet_address: wallet?.address
      });

      return {
        success: true,
        output: JSON.stringify(response.data.result, null, 2)
      };
    } catch (error) {
      return {
        success: false,
        output: error.response?.data?.error || error.message
      };
    }
  };

  const generateHelpOutput = () => {
    const helpText = `Available Raptoreum RPC Commands:

BLOCKCHAIN INFORMATION:
  getblockchaininfo     - Get blockchain information
  getblockcount         - Get current block count  
  getbestblockhash      - Get hash of best block
  getdifficulty         - Get current difficulty
  getnetworkhashps      - Get network hash rate

WALLET OPERATIONS:
  getwalletinfo         - Get wallet information
  getbalance            - Get wallet balance
  getnewaddress         - Generate new address
  listaddresses         - List all wallet addresses
  listtransactions      - List recent transactions
  listunspent           - List unspent outputs

ASSET MANAGEMENT:
  listassets            - List all assets
  getassetdata <name>   - Get asset information
  createasset <data>    - Create new asset
  mintasset <txid>      - Mint additional asset units
  sendasset <params>    - Send asset to address
  listassetsbalance     - List asset balances
  listunspentassets     - List unspent asset outputs

SMARTNODE OPERATIONS:
  smartnode list        - List all smartnodes
  smartnode status      - Get smartnode status
  smartnode create      - Create smartnode configuration
  smartnode start       - Start smartnode
  smartnode stop        - Stop smartnode

NETWORK & MINING:
  getpeerinfo          - Get connected peer information
  getnetworkinfo       - Get network information
  getmininginfo        - Get mining information
  getmempoolinfo       - Get mempool information

CONSOLE COMMANDS:
  help [command]       - Show help for specific command
  clear               - Clear console output
  history             - Show command history

Use Tab for command completion. Type 'help <command>' for detailed help.
`;

    return {
      success: true,
      output: helpText
    };
  };

  const generateCommandHelp = (cmd) => {
    const helpInfo = RAPTOREUM_COMMANDS[cmd.toLowerCase()];
    
    if (helpInfo) {
      return {
        success: true,
        output: `${cmd}: ${helpInfo}\n\nFor detailed parameter information, refer to Raptoreum RPC documentation.`
      };
    } else {
      return {
        success: false,
        output: `Unknown command: ${cmd}\nType 'help' for available commands.`
      };
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCommand(history[newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommand(history[newIndex] || '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommand('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleTabCompletion();
    }
  };

  const handleTabCompletion = () => {
    const partial = command.toLowerCase();
    const matches = Object.keys(RAPTOREUM_COMMANDS).filter(cmd => 
      cmd.startsWith(partial)
    );

    if (matches.length === 1) {
      setCommand(matches[0]);
    } else if (matches.length > 1) {
      // Show possible completions
      const completionOutput = {
        type: 'info',
        timestamp: new Date(),
        content: `Possible completions:\n${matches.join('\n')}`
      };
      setOutput(prev => [...prev, completionOutput]);
    }
  };

  const copyOutput = () => {
    const outputText = output.map(item => {
      const time = item.timestamp.toTimeString().slice(0, 8);
      return `[${time}] ${item.content}`;
    }).join('\n');

    navigator.clipboard.writeText(outputText).then(() => {
      const copyOutput = {
        type: 'info',
        timestamp: new Date(),
        content: 'Console output copied to clipboard'
      };
      setOutput(prev => [...prev, copyOutput]);
    });
  };

  const clearOutput = () => {
    setOutput([]);
  };

  const downloadOutput = () => {
    const outputText = output.map(item => {
      const time = item.timestamp.toLocaleString();
      return `[${time}] ${item.content}`;
    }).join('\n');

    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `raptorq-console-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getOutputIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'command':
        return <ChevronRight className="h-4 w-4 text-blue-400" />;
      case 'info':
        return <Server className="h-4 w-4 text-yellow-400" />;
      default:
        return <Terminal className="h-4 w-4 text-gray-400" />;
    }
  };

  const getOutputTextColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-300';
      case 'error':
        return 'text-red-300';
      case 'command':
        return 'text-blue-300';
      case 'info':
        return 'text-yellow-300';
      default:
        return 'text-gray-300';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-gray-900/95 to-black/80 border-gray-700/50 text-white max-w-6xl max-h-[90vh] mobile-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="h-5 w-5 text-green-400" />
              <span>RaptorQ Pro Console</span>
              <Badge className={`${
                isConnected ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'
              }`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={copyOutput}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
                title="Copy Output"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={downloadOutput}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
                title="Download Output"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={clearOutput}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
                title="Clear Output"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Console Output */}
          <div 
            ref={outputRef}
            className="h-96 bg-black/50 border border-gray-700/50 rounded-lg p-4 font-mono text-sm overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600"
          >
            {output.map((item, index) => (
              <div key={index} className="flex items-start space-x-2 mb-2">
                <div className="flex-shrink-0 mt-0.5">
                  {getOutputIcon(item.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs text-gray-500">
                      {item.timestamp.toTimeString().slice(0, 8)}
                    </span>
                  </div>
                  <pre 
                    className={`whitespace-pre-wrap break-words ${getOutputTextColor(item.type)}`}
                  >
                    {item.content}
                  </pre>
                </div>
              </div>
            ))}
            
            {isExecuting && (
              <div className="flex items-center space-x-2 text-gray-400">
                <Clock className="h-4 w-4 animate-spin" />
                <span>Executing command...</span>
              </div>
            )}
          </div>

          {/* Command Input */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 text-green-400">
              <ChevronRight className="h-4 w-4" />
              <span className="font-mono text-sm">raptorq:</span>
            </div>
            <Input
              ref={inputRef}
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter Raptoreum RPC command..."
              className="flex-1 bg-black/50 border-gray-700/50 text-white font-mono placeholder-gray-500"
              disabled={!isConnected || isExecuting}
            />
            <Button
              onClick={executeCommand}
              disabled={!command.trim() || !isConnected || isExecuting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isExecuting ? (
                <Clock className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Quick Commands */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-400">Quick commands:</span>
            {['help', 'getwalletinfo', 'getbalance', 'listassets', 'smartnode list'].map(cmd => (
              <Button
                key={cmd}
                size="sm"
                variant="outline"
                onClick={() => setCommand(cmd)}
                className="border-gray-600 text-gray-300 hover:bg-gray-800 text-xs"
              >
                {cmd}
              </Button>
            ))}
          </div>

          {/* Status Bar */}
          <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-700/50">
            <div className="flex items-center space-x-4">
              <span>History: {history.length} commands</span>
              <span>Output: {output.length} lines</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Use ↑↓ for history, Tab for completion</span>
              {isConnected ? (
                <Badge className="bg-green-900/30 text-green-300 text-xs">
                  RPC Connected
                </Badge>
              ) : (
                <Badge className="bg-red-900/30 text-red-300 text-xs">
                  RPC Disconnected
                </Badge>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProModeConsole;