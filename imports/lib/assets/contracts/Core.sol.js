var Web3 = require("web3");
var SolidityEvent = require("web3/lib/web3/event.js");

(function() {
  // Planned for future features, logging, etc.
  function Provider(provider) {
    this.provider = provider;
  }

  Provider.prototype.send = function() {
    this.provider.send.apply(this.provider, arguments);
  };

  Provider.prototype.sendAsync = function() {
    this.provider.sendAsync.apply(this.provider, arguments);
  };

  var BigNumber = (new Web3()).toBigNumber(0).constructor;

  var Utils = {
    is_object: function(val) {
      return typeof val == "object" && !Array.isArray(val);
    },
    is_big_number: function(val) {
      if (typeof val != "object") return false;

      // Instanceof won't work because we have multiple versions of Web3.
      try {
        new BigNumber(val);
        return true;
      } catch (e) {
        return false;
      }
    },
    merge: function() {
      var merged = {};
      var args = Array.prototype.slice.call(arguments);

      for (var i = 0; i < args.length; i++) {
        var object = args[i];
        var keys = Object.keys(object);
        for (var j = 0; j < keys.length; j++) {
          var key = keys[j];
          var value = object[key];
          merged[key] = value;
        }
      }

      return merged;
    },
    promisifyFunction: function(fn, C) {
      var self = this;
      return function() {
        var instance = this;

        var args = Array.prototype.slice.call(arguments);
        var tx_params = {};
        var last_arg = args[args.length - 1];

        // It's only tx_params if it's an object and not a BigNumber.
        if (Utils.is_object(last_arg) && !Utils.is_big_number(last_arg)) {
          tx_params = args.pop();
        }

        tx_params = Utils.merge(C.class_defaults, tx_params);

        return new Promise(function(accept, reject) {
          var callback = function(error, result) {
            if (error != null) {
              reject(error);
            } else {
              accept(result);
            }
          };
          args.push(tx_params, callback);
          fn.apply(instance.contract, args);
        });
      };
    },
    synchronizeFunction: function(fn, instance, C) {
      var self = this;
      return function() {
        var args = Array.prototype.slice.call(arguments);
        var tx_params = {};
        var last_arg = args[args.length - 1];

        // It's only tx_params if it's an object and not a BigNumber.
        if (Utils.is_object(last_arg) && !Utils.is_big_number(last_arg)) {
          tx_params = args.pop();
        }

        tx_params = Utils.merge(C.class_defaults, tx_params);

        return new Promise(function(accept, reject) {

          var decodeLogs = function(logs) {
            return logs.map(function(log) {
              var logABI = C.events[log.topics[0]];

              if (logABI == null) {
                return null;
              }

              var decoder = new SolidityEvent(null, logABI, instance.address);
              return decoder.decode(log);
            }).filter(function(log) {
              return log != null;
            });
          };

          var callback = function(error, tx) {
            if (error != null) {
              reject(error);
              return;
            }

            var timeout = C.synchronization_timeout || 240000;
            var start = new Date().getTime();

            var make_attempt = function() {
              C.web3.eth.getTransactionReceipt(tx, function(err, receipt) {
                if (err) return reject(err);

                if (receipt != null) {
                  // If they've opted into next gen, return more information.
                  if (C.next_gen == true) {
                    return accept({
                      tx: tx,
                      receipt: receipt,
                      logs: decodeLogs(receipt.logs)
                    });
                  } else {
                    return accept(tx);
                  }
                }

                if (timeout > 0 && new Date().getTime() - start > timeout) {
                  return reject(new Error("Transaction " + tx + " wasn't processed in " + (timeout / 1000) + " seconds!"));
                }

                setTimeout(make_attempt, 1000);
              });
            };

            make_attempt();
          };

          args.push(tx_params, callback);
          fn.apply(self, args);
        });
      };
    }
  };

  function instantiate(instance, contract) {
    instance.contract = contract;
    var constructor = instance.constructor;

    // Provision our functions.
    for (var i = 0; i < instance.abi.length; i++) {
      var item = instance.abi[i];
      if (item.type == "function") {
        if (item.constant == true) {
          instance[item.name] = Utils.promisifyFunction(contract[item.name], constructor);
        } else {
          instance[item.name] = Utils.synchronizeFunction(contract[item.name], instance, constructor);
        }

        instance[item.name].call = Utils.promisifyFunction(contract[item.name].call, constructor);
        instance[item.name].sendTransaction = Utils.promisifyFunction(contract[item.name].sendTransaction, constructor);
        instance[item.name].request = contract[item.name].request;
        instance[item.name].estimateGas = Utils.promisifyFunction(contract[item.name].estimateGas, constructor);
      }

      if (item.type == "event") {
        instance[item.name] = contract[item.name];
      }
    }

    instance.allEvents = contract.allEvents;
    instance.address = contract.address;
    instance.transactionHash = contract.transactionHash;
  };

  // Use inheritance to create a clone of this contract,
  // and copy over contract's static functions.
  function mutate(fn) {
    var temp = function Clone() { return fn.apply(this, arguments); };

    Object.keys(fn).forEach(function(key) {
      temp[key] = fn[key];
    });

    temp.prototype = Object.create(fn.prototype);
    bootstrap(temp);
    return temp;
  };

  function bootstrap(fn) {
    fn.web3 = new Web3();
    fn.class_defaults  = fn.prototype.defaults || {};

    // Set the network iniitally to make default data available and re-use code.
    // Then remove the saved network id so the network will be auto-detected on first use.
    fn.setNetwork("default");
    fn.network_id = null;
    return fn;
  };

  // Accepts a contract object created with web3.eth.contract.
  // Optionally, if called without `new`, accepts a network_id and will
  // create a new version of the contract abstraction with that network_id set.
  function Contract() {
    if (this instanceof Contract) {
      instantiate(this, arguments[0]);
    } else {
      var C = mutate(Contract);
      var network_id = arguments.length > 0 ? arguments[0] : "default";
      C.setNetwork(network_id);
      return C;
    }
  };

  Contract.currentProvider = null;

  Contract.setProvider = function(provider) {
    var wrapped = new Provider(provider);
    this.web3.setProvider(wrapped);
    this.currentProvider = provider;
  };

  Contract.new = function() {
    if (this.currentProvider == null) {
      throw new Error("Core error: Please call setProvider() first before calling new().");
    }

    var args = Array.prototype.slice.call(arguments);

    if (!this.unlinked_binary) {
      throw new Error("Core error: contract binary not set. Can't deploy new instance.");
    }

    var regex = /__[^_]+_+/g;
    var unlinked_libraries = this.binary.match(regex);

    if (unlinked_libraries != null) {
      unlinked_libraries = unlinked_libraries.map(function(name) {
        // Remove underscores
        return name.replace(/_/g, "");
      }).sort().filter(function(name, index, arr) {
        // Remove duplicates
        if (index + 1 >= arr.length) {
          return true;
        }

        return name != arr[index + 1];
      }).join(", ");

      throw new Error("Core contains unresolved libraries. You must deploy and link the following libraries before you can deploy a new version of Core: " + unlinked_libraries);
    }

    var self = this;

    return new Promise(function(accept, reject) {
      var contract_class = self.web3.eth.contract(self.abi);
      var tx_params = {};
      var last_arg = args[args.length - 1];

      // It's only tx_params if it's an object and not a BigNumber.
      if (Utils.is_object(last_arg) && !Utils.is_big_number(last_arg)) {
        tx_params = args.pop();
      }

      tx_params = Utils.merge(self.class_defaults, tx_params);

      if (tx_params.data == null) {
        tx_params.data = self.binary;
      }

      // web3 0.9.0 and above calls new twice this callback twice.
      // Why, I have no idea...
      var intermediary = function(err, web3_instance) {
        if (err != null) {
          reject(err);
          return;
        }

        if (err == null && web3_instance != null && web3_instance.address != null) {
          accept(new self(web3_instance));
        }
      };

      args.push(tx_params, intermediary);
      contract_class.new.apply(contract_class, args);
    });
  };

  Contract.at = function(address) {
    if (address == null || typeof address != "string" || address.length != 42) {
      throw new Error("Invalid address passed to Core.at(): " + address);
    }

    var contract_class = this.web3.eth.contract(this.abi);
    var contract = contract_class.at(address);

    return new this(contract);
  };

  Contract.deployed = function() {
    if (!this.address) {
      throw new Error("Cannot find deployed address: Core not deployed or address not set.");
    }

    return this.at(this.address);
  };

  Contract.defaults = function(class_defaults) {
    if (this.class_defaults == null) {
      this.class_defaults = {};
    }

    if (class_defaults == null) {
      class_defaults = {};
    }

    var self = this;
    Object.keys(class_defaults).forEach(function(key) {
      var value = class_defaults[key];
      self.class_defaults[key] = value;
    });

    return this.class_defaults;
  };

  Contract.extend = function() {
    var args = Array.prototype.slice.call(arguments);

    for (var i = 0; i < arguments.length; i++) {
      var object = arguments[i];
      var keys = Object.keys(object);
      for (var j = 0; j < keys.length; j++) {
        var key = keys[j];
        var value = object[key];
        this.prototype[key] = value;
      }
    }
  };

  Contract.all_networks = {
  "3": {
    "abi": [
      {
        "constant": false,
        "inputs": [
          {
            "name": "_spender",
            "type": "address"
          },
          {
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "approve",
        "outputs": [
          {
            "name": "success",
            "type": "bool"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "sumAssetsSold",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "onExchange",
            "type": "address"
          },
          {
            "name": "sell_how_much",
            "type": "uint256"
          },
          {
            "name": "sell_which_token",
            "type": "address"
          },
          {
            "name": "buy_how_much",
            "type": "uint256"
          },
          {
            "name": "buy_which_token",
            "type": "address"
          }
        ],
        "name": "offer",
        "outputs": [],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "wantedShares",
            "type": "uint256"
          }
        ],
        "name": "createShares",
        "outputs": [],
        "payable": true,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_from",
            "type": "address"
          },
          {
            "name": "_to",
            "type": "address"
          },
          {
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "transferFrom",
        "outputs": [
          {
            "name": "success",
            "type": "bool"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "calcNAV",
        "outputs": [
          {
            "name": "nav",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_owner",
            "type": "address"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "name": "balance",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "ofToken",
            "type": "address"
          },
          {
            "name": "approvalAmount",
            "type": "uint256"
          }
        ],
        "name": "approveSpending",
        "outputs": [],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "sharePrice",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "calcSharePrice",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "onExchange",
            "type": "address"
          },
          {
            "name": "id",
            "type": "uint256"
          }
        ],
        "name": "cancel",
        "outputs": [],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "offeredShares",
            "type": "uint256"
          },
          {
            "name": "wantedAmount",
            "type": "uint256"
          }
        ],
        "name": "annihilateShares",
        "outputs": [],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "sumInvested",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "onExchange",
            "type": "address"
          },
          {
            "name": "id",
            "type": "uint256"
          },
          {
            "name": "quantity",
            "type": "uint256"
          }
        ],
        "name": "buy",
        "outputs": [],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_to",
            "type": "address"
          },
          {
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "transfer",
        "outputs": [
          {
            "name": "success",
            "type": "bool"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "ETHER_TOKEN_INDEX_IN_REGISTRAR",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "calcGAV",
        "outputs": [
          {
            "name": "gav",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "calcDelta",
        "outputs": [
          {
            "name": "delta",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_owner",
            "type": "address"
          },
          {
            "name": "_spender",
            "type": "address"
          }
        ],
        "name": "allowance",
        "outputs": [
          {
            "name": "remaining",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "sumWithdrawn",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "sumAssetsBought",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "inputs": [
          {
            "name": "ofManager",
            "type": "address"
          },
          {
            "name": "ofRegistrar",
            "type": "address"
          },
          {
            "name": "ofTrading",
            "type": "address"
          },
          {
            "name": "ofManagmentFee",
            "type": "address"
          },
          {
            "name": "ofPerformanceFee",
            "type": "address"
          }
        ],
        "payable": false,
        "type": "constructor"
      },
      {
        "payable": true,
        "type": "fallback"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "buyer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "numShares",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "sharePrice",
            "type": "uint256"
          }
        ],
        "name": "SharesCreated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "seller",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "numShares",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "sharePrice",
            "type": "uint256"
          }
        ],
        "name": "SharesAnnihilated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Refund",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "_from",
            "type": "address"
          },
          {
            "indexed": true,
            "name": "_to",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "Transfer",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "_owner",
            "type": "address"
          },
          {
            "indexed": true,
            "name": "_spender",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "Approval",
        "type": "event"
      }
    ],
    "unlinked_binary": "0x6060604052670de0b6b3a7640000601555346100005760405160a08061150a83398101604090815281516020830151918301516060840151608090940151919390915b5b60038054600160a060020a0319166c01000000000000000000000000338102041790555b600380546c01000000000000000000000000808802819004600160a060020a03199283161790925560006008819055670de0b6b3a764000060095542600a55600c80548885029490940493909216929092179081905560408051602090810184905281517faa9239f5000000000000000000000000000000000000000000000000000000008152600481018590529151600160a060020a03939093169363aa9239f5936024808501949192918390030190829087803b156100005760325a03f11561000057505060405151600b8054600160a060020a03199081166c0100000000000000000000000093840284900417909155600f80548216878402849004179055600d80548216868402849004179055600e805490911684830292909204919091179055505b50505050505b611368806101a26000396000f3606060405236156101115760e060020a6000350463095ea7b3811461011a5780630deff91e146101415780630f1bd81114610160578063123c047a1461017e57806318160ddd1461018b57806323b872dd146101aa5780633327570b146101d457806370a08231146101f35780637d4b719514610215578063872697291461022a5780638da5cb5b146102495780639489fa841461027257806398590ef914610291578063a108785a146102a6578063a442414f146102bb578063a59ac6dd146102da578063a9059cbb146102f2578063ab49a48a14610319578063b37011bf14610338578063dcb9690c14610357578063dd62ed3e14610376578063e6e8a3271461039b578063f4d6f828146103ba575b6101185b5b565b005b346100005761012d6004356024356103d9565b604080519115158252519081900360200190f35b346100005761014e610444565b60408051918252519081900360200190f35b346100005761011860043560243560443560643560843561044a565b005b61011860043561064a565b005b346100005761014e610867565b60408051918252519081900360200190f35b346100005761012d60043560243560443561086d565b604080519115158252519081900360200190f35b346100005761014e61097e565b60408051918252519081900360200190f35b346100005761014e600435610996565b60408051918252519081900360200190f35b34610000576101186004356024356109b5565b005b346100005761014e610b0c565b60408051918252519081900360200190f35b3461000057610256610b12565b60408051600160a060020a039092168252519081900360200190f35b346100005761014e610b21565b60408051918252519081900360200190f35b3461000057610118600435602435610b31565b005b3461000057610118600435602435610ba4565b005b346100005761014e610dee565b60408051918252519081900360200190f35b3461000057610118600435602435604435610df4565b005b346100005761012d600435602435610e70565b604080519115158252519081900360200190f35b346100005761014e610f37565b60408051918252519081900360200190f35b346100005761014e610f3c565b60408051918252519081900360200190f35b346100005761014e611279565b60408051918252519081900360200190f35b346100005761014e6004356024356112de565b60408051918252519081900360200190f35b346100005761014e61130b565b60408051918252519081900360200190f35b346100005761014e611311565b60408051918252519081900360200190f35b600160a060020a03338116600081815260016020908152604080832094871680845294825280832086905580518681529051929493927f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925929181900390910190a35060015b92915050565b60145481565b60035433600160a060020a0390811691161461046557610000565b600c546040805160006020918201819052825160e360020a631a42387b028152600160a060020a038089166004830152935188958b956104e49591169363d211c3d89360248082019492918390030190829087803b156100005760325a03f11561000057505060405151600160a060020a038481169116149050611317565b600c546040805160006020918201819052825160e060020a63ab3a7425028152600160a060020a038a81166004830152935161055395949094169363ab3a74259360248084019491938390030190829087803b156100005760325a03f115610000575050604051519050611317565b600c546040805160006020918201819052825160e060020a63ab3a7425028152600160a060020a03888116600483015293516105c295949094169363ab3a74259360248084019491938390030190829087803b156100005760325a03f115610000575050604051519050611317565b86600160a060020a031663f09ea2a6878787876000604051602001526040518560e060020a0281526004018085815260200184600160a060020a0316815260200183815260200182600160a060020a03168152602001945050505050602060405180830381600087803b156100005760325a03f115610000575050505b5b50505b5050505050565b600060006000600061065d813411611317565b84610669811515611317565b610671610b21565b6015819055349550670de0b6b3a76400009087020493508484116107dc57600160a060020a0333166000908152602081905260409020546106b29087611327565b600160a060020a0333166000908152602081905260409020556002546106d89087611327565b6002556011546106e89085611327565b6011556008546106f89085611327565b60085560065460ff161515610715576006805460ff191660011790555b600b5460408051600060209182015281517fd0e30db0000000000000000000000000000000000000000000000000000000008152915161078f93600160a060020a03169263d0e30db092899260048084019382900301818588803b156100005761235a5a03f1156100005750506040515191506113179050565b60155460408051600160a060020a03331681526020810189905280820192909252517ff8495c533745eb3efa4d74ccdbbd0938e9d1e88add51cdc7db168a9f15a737369181900360600190a15b8484101561085c57604051848603935061081790600160a060020a0333169085156108fc029086906000818181858888f19350505050611317565b60408051600160a060020a03331681526020810185905281517fbb28353e4598c3b9199101a66e0989549b659a59a54d2c27fbb183f1932c8e6d929181900390910190a15b5b5b505b5050505050565b60025481565b600160a060020a0383166000908152602081905260408120548290108015906108bd5750600160a060020a0380851660009081526001602090815260408083203390941683529290522054829010155b80156108e25750600160a060020a038316600090815260208190526040902054828101115b1561097257600160a060020a0380841660008181526020818152604080832080548801905588851680845281842080548990039055600183528184203390961684529482529182902080548790039055815186815291519293927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9281900390910190a350600161097656610976565b5060005b5b9392505050565b60008080808061098c610f3c565b030392505b505090565b600160a060020a0381166000908152602081905260409020545b919050565b60035433600160a060020a039081169116146109d057610000565b600c546040805160006020918201819052825160e060020a63ab3a7425028152600160a060020a0387811660048301529351610a3f95949094169363ab3a74259360248084019491938390030190829087803b156100005760325a03f115610000575050604051519050611317565b600c546040805160006020918201819052825160e360020a631a42387b028152600160a060020a03808816600483018190529451949563095ea7b39591169363d211c3d8936024808501949293928390030190829087803b156100005760325a03f1156100005750505060405180519060200150836000604051602001526040518360e060020a0281526004018083600160a060020a0316815260200182815260200192505050602060405180830381600087803b156100005760325a03f115610000575050505b5b5050565b60155481565b600354600160a060020a031681565b6000610b2b611279565b90505b90565b60035433600160a060020a03908116911614610b4c57610000565b81600160a060020a03166340e58ee5826000604051602001526040518260e060020a02815260040180828152602001915050602060405180830381600087803b156100005760325a03f115610000575050505b5b5050565b6000600083610bd1816000600033600160a060020a03168152602001908152602001600020541015611317565b83610be88130600160a060020a0316311015611317565b84610bf4811515611317565b86610c00811515611317565b610c08610b21565b6015819055670de0b6b3a7640000908902049550858711610d8c57600160a060020a033316600090815260208190526040902054610c46908961134f565b600160a060020a033316600090815260208190526040902055600254610c6c908961134f565b600255601254610c7c9087611327565b601255600854610c8c908761134f565b600855600b54604080516000602091820181905282517f2e1a7d4d000000000000000000000000000000000000000000000000000000008152600481018b90529251610d1194600160a060020a031693632e1a7d4d936024808301949193928390030190829087803b156100005760325a03f115610000575050604051519050611317565b604051610d3f90600160a060020a0333169088156108fc029089906000818181858888f19350505050611317565b60155460408051600160a060020a0333168152602081018b905280820192909252517f6d1ea56dcd6dcf937743a4f926190b72632e8d241b3939423c443d3ad1d309d49181900360600190a15b85871015610ddf5760408051600160a060020a03331681528888036020820181905282519097507fbb28353e4598c3b9199101a66e0989549b659a59a54d2c27fbb183f1932c8e6d929181900390910190a15b5b5b505b505b505b5050505050565b60115481565b60035433600160a060020a03908116911614610e0f57610000565b82600160a060020a031663d6febde883836000604051602001526040518360e060020a0281526004018083815260200182815260200192505050602060405180830381600087803b156100005760325a03f115610000575050505b5b505050565b600160a060020a033316600090815260208190526040812054829010801590610eb25750600160a060020a038316600090815260208190526040902054828101115b15610f2857600160a060020a0333811660008181526020818152604080832080548890039055938716808352918490208054870190558351868152935191937fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef929081900390910190a350600161043e5661043e565b50600061043e565b5b92915050565b600081565b6000600060006000600060006000600b60000160009054906101000a9004600160a060020a0316600160a060020a03166370a08231306000604051602001526040518260e060020a0281526004018082600160a060020a03168152602001915050602060405180830381600087803b156100005760325a03f115610000575050604080518051600c546000602093840181905284517f0132d1600000000000000000000000000000000000000000000000000000000081529451929c50600160a060020a039091169450630132d160936004808201949392918390030190829087803b156100005760325a03f11561000057505060405151965060009550505b8585101561126f5784151561105057611264565b600c546040805160006020918201819052825160e060020a63aa9239f5028152600481018a90529251600160a060020a039094169363aa9239f59360248082019493918390030190829087803b156100005760325a03f1156100005750505060405180519060200150935083600160a060020a03166370a08231306000604051602001526040518260e060020a0281526004018082600160a060020a03168152602001915050602060405180830381600087803b156100005760325a03f115610000575050604080518051600c546000602093840181905284517f6532aad9000000000000000000000000000000000000000000000000000000008152600481018c90529451929850600160a060020a039091169450636532aad9936024808201949392918390030190829087803b156100005760325a03f115610000575050604080518051600c5460006020938401819052845160e060020a63aa9239f5028152600481018c90529451929750600160a060020a0380891696506341976e099592169363aa9239f593602480850194929391928390030190829087803b156100005760325a03f11561000057505050604051805190602001506000604051602001526040518260e060020a0281526004018082600160a060020a03168152602001915050602060405180830381600087803b156100005760325a03f1156100005750506040515184810298909801979150505b84600101945061103c565b5b50505050505090565b6000600061128561097e565b60085490915015156112a157670de0b6b3a764000091506112ca565b8015156112b857670de0b6b3a764000091506112ca565b60085460095482028115610000570491505b5b6009829055600881905542600a555b5090565b600160a060020a038083166000908152600160209081526040808320938516835292905220545b92915050565b60125481565b60135481565b80151561132357610000565b5b50565b600082820161134484821080159061133f5750838210155b611317565b8091505b5092915050565b600061135d83831115611317565b508082035b9291505056",
    "events": {
      "0xf8495c533745eb3efa4d74ccdbbd0938e9d1e88add51cdc7db168a9f15a73736": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "buyer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "numShares",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "sharePrice",
            "type": "uint256"
          }
        ],
        "name": "SharesCreated",
        "type": "event"
      },
      "0x6d1ea56dcd6dcf937743a4f926190b72632e8d241b3939423c443d3ad1d309d4": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "seller",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "numShares",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "sharePrice",
            "type": "uint256"
          }
        ],
        "name": "SharesAnnihilated",
        "type": "event"
      },
      "0xbb28353e4598c3b9199101a66e0989549b659a59a54d2c27fbb183f1932c8e6d": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Refund",
        "type": "event"
      },
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "_from",
            "type": "address"
          },
          {
            "indexed": true,
            "name": "_to",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "Transfer",
        "type": "event"
      },
      "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "_owner",
            "type": "address"
          },
          {
            "indexed": true,
            "name": "_spender",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "Approval",
        "type": "event"
      }
    },
    "updated_at": 1482327608411,
    "links": {}
  },
  "default": {
    "abi": [
      {
        "constant": false,
        "inputs": [
          {
            "name": "_spender",
            "type": "address"
          },
          {
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "approve",
        "outputs": [
          {
            "name": "success",
            "type": "bool"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "sumAssetsSold",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "onExchange",
            "type": "address"
          },
          {
            "name": "sell_how_much",
            "type": "uint256"
          },
          {
            "name": "sell_which_token",
            "type": "address"
          },
          {
            "name": "buy_how_much",
            "type": "uint256"
          },
          {
            "name": "buy_which_token",
            "type": "address"
          }
        ],
        "name": "offer",
        "outputs": [],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "wantedShares",
            "type": "uint256"
          }
        ],
        "name": "createShares",
        "outputs": [],
        "payable": true,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_from",
            "type": "address"
          },
          {
            "name": "_to",
            "type": "address"
          },
          {
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "transferFrom",
        "outputs": [
          {
            "name": "success",
            "type": "bool"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "calcNAV",
        "outputs": [
          {
            "name": "nav",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_owner",
            "type": "address"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "name": "balance",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "ofToken",
            "type": "address"
          },
          {
            "name": "approvalAmount",
            "type": "uint256"
          }
        ],
        "name": "approveSpending",
        "outputs": [],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "sharePrice",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "calcSharePrice",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "onExchange",
            "type": "address"
          },
          {
            "name": "id",
            "type": "uint256"
          }
        ],
        "name": "cancel",
        "outputs": [],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "offeredShares",
            "type": "uint256"
          },
          {
            "name": "wantedAmount",
            "type": "uint256"
          }
        ],
        "name": "annihilateShares",
        "outputs": [],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "sumInvested",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "onExchange",
            "type": "address"
          },
          {
            "name": "id",
            "type": "uint256"
          },
          {
            "name": "quantity",
            "type": "uint256"
          }
        ],
        "name": "buy",
        "outputs": [],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_to",
            "type": "address"
          },
          {
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "transfer",
        "outputs": [
          {
            "name": "success",
            "type": "bool"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "ETHER_TOKEN_INDEX_IN_REGISTRAR",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "calcGAV",
        "outputs": [
          {
            "name": "gav",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "calcDelta",
        "outputs": [
          {
            "name": "delta",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_owner",
            "type": "address"
          },
          {
            "name": "_spender",
            "type": "address"
          }
        ],
        "name": "allowance",
        "outputs": [
          {
            "name": "remaining",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "sumWithdrawn",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "sumAssetsBought",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "inputs": [
          {
            "name": "ofManager",
            "type": "address"
          },
          {
            "name": "ofRegistrar",
            "type": "address"
          },
          {
            "name": "ofTrading",
            "type": "address"
          },
          {
            "name": "ofManagmentFee",
            "type": "address"
          },
          {
            "name": "ofPerformanceFee",
            "type": "address"
          }
        ],
        "payable": false,
        "type": "constructor"
      },
      {
        "payable": true,
        "type": "fallback"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "buyer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "numShares",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "sharePrice",
            "type": "uint256"
          }
        ],
        "name": "SharesCreated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "seller",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "numShares",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "sharePrice",
            "type": "uint256"
          }
        ],
        "name": "SharesAnnihilated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Refund",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "_from",
            "type": "address"
          },
          {
            "indexed": true,
            "name": "_to",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "Transfer",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "_owner",
            "type": "address"
          },
          {
            "indexed": true,
            "name": "_spender",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "Approval",
        "type": "event"
      }
    ],
    "unlinked_binary": "0x6060604052670de0b6b3a7640000601555346100005760405160a08061150a83398101604090815281516020830151918301516060840151608090940151919390915b5b60038054600160a060020a0319166c01000000000000000000000000338102041790555b600380546c01000000000000000000000000808802819004600160a060020a03199283161790925560006008819055670de0b6b3a764000060095542600a55600c80548885029490940493909216929092179081905560408051602090810184905281517faa9239f5000000000000000000000000000000000000000000000000000000008152600481018590529151600160a060020a03939093169363aa9239f5936024808501949192918390030190829087803b156100005760325a03f11561000057505060405151600b8054600160a060020a03199081166c0100000000000000000000000093840284900417909155600f80548216878402849004179055600d80548216868402849004179055600e805490911684830292909204919091179055505b50505050505b611368806101a26000396000f3606060405236156101115760e060020a6000350463095ea7b3811461011a5780630deff91e146101415780630f1bd81114610160578063123c047a1461017e57806318160ddd1461018b57806323b872dd146101aa5780633327570b146101d457806370a08231146101f35780637d4b719514610215578063872697291461022a5780638da5cb5b146102495780639489fa841461027257806398590ef914610291578063a108785a146102a6578063a442414f146102bb578063a59ac6dd146102da578063a9059cbb146102f2578063ab49a48a14610319578063b37011bf14610338578063dcb9690c14610357578063dd62ed3e14610376578063e6e8a3271461039b578063f4d6f828146103ba575b6101185b5b565b005b346100005761012d6004356024356103d9565b604080519115158252519081900360200190f35b346100005761014e610444565b60408051918252519081900360200190f35b346100005761011860043560243560443560643560843561044a565b005b61011860043561064a565b005b346100005761014e610867565b60408051918252519081900360200190f35b346100005761012d60043560243560443561086d565b604080519115158252519081900360200190f35b346100005761014e61097e565b60408051918252519081900360200190f35b346100005761014e600435610996565b60408051918252519081900360200190f35b34610000576101186004356024356109b5565b005b346100005761014e610b0c565b60408051918252519081900360200190f35b3461000057610256610b12565b60408051600160a060020a039092168252519081900360200190f35b346100005761014e610b21565b60408051918252519081900360200190f35b3461000057610118600435602435610b31565b005b3461000057610118600435602435610ba4565b005b346100005761014e610dee565b60408051918252519081900360200190f35b3461000057610118600435602435604435610df4565b005b346100005761012d600435602435610e70565b604080519115158252519081900360200190f35b346100005761014e610f37565b60408051918252519081900360200190f35b346100005761014e610f3c565b60408051918252519081900360200190f35b346100005761014e611279565b60408051918252519081900360200190f35b346100005761014e6004356024356112de565b60408051918252519081900360200190f35b346100005761014e61130b565b60408051918252519081900360200190f35b346100005761014e611311565b60408051918252519081900360200190f35b600160a060020a03338116600081815260016020908152604080832094871680845294825280832086905580518681529051929493927f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925929181900390910190a35060015b92915050565b60145481565b60035433600160a060020a0390811691161461046557610000565b600c546040805160006020918201819052825160e360020a631a42387b028152600160a060020a038089166004830152935188958b956104e49591169363d211c3d89360248082019492918390030190829087803b156100005760325a03f11561000057505060405151600160a060020a038481169116149050611317565b600c546040805160006020918201819052825160e060020a63ab3a7425028152600160a060020a038a81166004830152935161055395949094169363ab3a74259360248084019491938390030190829087803b156100005760325a03f115610000575050604051519050611317565b600c546040805160006020918201819052825160e060020a63ab3a7425028152600160a060020a03888116600483015293516105c295949094169363ab3a74259360248084019491938390030190829087803b156100005760325a03f115610000575050604051519050611317565b86600160a060020a031663f09ea2a6878787876000604051602001526040518560e060020a0281526004018085815260200184600160a060020a0316815260200183815260200182600160a060020a03168152602001945050505050602060405180830381600087803b156100005760325a03f115610000575050505b5b50505b5050505050565b600060006000600061065d813411611317565b84610669811515611317565b610671610b21565b6015819055349550670de0b6b3a76400009087020493508484116107dc57600160a060020a0333166000908152602081905260409020546106b29087611327565b600160a060020a0333166000908152602081905260409020556002546106d89087611327565b6002556011546106e89085611327565b6011556008546106f89085611327565b60085560065460ff161515610715576006805460ff191660011790555b600b5460408051600060209182015281517fd0e30db0000000000000000000000000000000000000000000000000000000008152915161078f93600160a060020a03169263d0e30db092899260048084019382900301818588803b156100005761235a5a03f1156100005750506040515191506113179050565b60155460408051600160a060020a03331681526020810189905280820192909252517ff8495c533745eb3efa4d74ccdbbd0938e9d1e88add51cdc7db168a9f15a737369181900360600190a15b8484101561085c57604051848603935061081790600160a060020a0333169085156108fc029086906000818181858888f19350505050611317565b60408051600160a060020a03331681526020810185905281517fbb28353e4598c3b9199101a66e0989549b659a59a54d2c27fbb183f1932c8e6d929181900390910190a15b5b5b505b5050505050565b60025481565b600160a060020a0383166000908152602081905260408120548290108015906108bd5750600160a060020a0380851660009081526001602090815260408083203390941683529290522054829010155b80156108e25750600160a060020a038316600090815260208190526040902054828101115b1561097257600160a060020a0380841660008181526020818152604080832080548801905588851680845281842080548990039055600183528184203390961684529482529182902080548790039055815186815291519293927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9281900390910190a350600161097656610976565b5060005b5b9392505050565b60008080808061098c610f3c565b030392505b505090565b600160a060020a0381166000908152602081905260409020545b919050565b60035433600160a060020a039081169116146109d057610000565b600c546040805160006020918201819052825160e060020a63ab3a7425028152600160a060020a0387811660048301529351610a3f95949094169363ab3a74259360248084019491938390030190829087803b156100005760325a03f115610000575050604051519050611317565b600c546040805160006020918201819052825160e360020a631a42387b028152600160a060020a03808816600483018190529451949563095ea7b39591169363d211c3d8936024808501949293928390030190829087803b156100005760325a03f1156100005750505060405180519060200150836000604051602001526040518360e060020a0281526004018083600160a060020a0316815260200182815260200192505050602060405180830381600087803b156100005760325a03f115610000575050505b5b5050565b60155481565b600354600160a060020a031681565b6000610b2b611279565b90505b90565b60035433600160a060020a03908116911614610b4c57610000565b81600160a060020a03166340e58ee5826000604051602001526040518260e060020a02815260040180828152602001915050602060405180830381600087803b156100005760325a03f115610000575050505b5b5050565b6000600083610bd1816000600033600160a060020a03168152602001908152602001600020541015611317565b83610be88130600160a060020a0316311015611317565b84610bf4811515611317565b86610c00811515611317565b610c08610b21565b6015819055670de0b6b3a7640000908902049550858711610d8c57600160a060020a033316600090815260208190526040902054610c46908961134f565b600160a060020a033316600090815260208190526040902055600254610c6c908961134f565b600255601254610c7c9087611327565b601255600854610c8c908761134f565b600855600b54604080516000602091820181905282517f2e1a7d4d000000000000000000000000000000000000000000000000000000008152600481018b90529251610d1194600160a060020a031693632e1a7d4d936024808301949193928390030190829087803b156100005760325a03f115610000575050604051519050611317565b604051610d3f90600160a060020a0333169088156108fc029089906000818181858888f19350505050611317565b60155460408051600160a060020a0333168152602081018b905280820192909252517f6d1ea56dcd6dcf937743a4f926190b72632e8d241b3939423c443d3ad1d309d49181900360600190a15b85871015610ddf5760408051600160a060020a03331681528888036020820181905282519097507fbb28353e4598c3b9199101a66e0989549b659a59a54d2c27fbb183f1932c8e6d929181900390910190a15b5b5b505b505b505b5050505050565b60115481565b60035433600160a060020a03908116911614610e0f57610000565b82600160a060020a031663d6febde883836000604051602001526040518360e060020a0281526004018083815260200182815260200192505050602060405180830381600087803b156100005760325a03f115610000575050505b5b505050565b600160a060020a033316600090815260208190526040812054829010801590610eb25750600160a060020a038316600090815260208190526040902054828101115b15610f2857600160a060020a0333811660008181526020818152604080832080548890039055938716808352918490208054870190558351868152935191937fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef929081900390910190a350600161043e5661043e565b50600061043e565b5b92915050565b600081565b6000600060006000600060006000600b60000160009054906101000a9004600160a060020a0316600160a060020a03166370a08231306000604051602001526040518260e060020a0281526004018082600160a060020a03168152602001915050602060405180830381600087803b156100005760325a03f115610000575050604080518051600c546000602093840181905284517f0132d1600000000000000000000000000000000000000000000000000000000081529451929c50600160a060020a039091169450630132d160936004808201949392918390030190829087803b156100005760325a03f11561000057505060405151965060009550505b8585101561126f5784151561105057611264565b600c546040805160006020918201819052825160e060020a63aa9239f5028152600481018a90529251600160a060020a039094169363aa9239f59360248082019493918390030190829087803b156100005760325a03f1156100005750505060405180519060200150935083600160a060020a03166370a08231306000604051602001526040518260e060020a0281526004018082600160a060020a03168152602001915050602060405180830381600087803b156100005760325a03f115610000575050604080518051600c546000602093840181905284517f6532aad9000000000000000000000000000000000000000000000000000000008152600481018c90529451929850600160a060020a039091169450636532aad9936024808201949392918390030190829087803b156100005760325a03f115610000575050604080518051600c5460006020938401819052845160e060020a63aa9239f5028152600481018c90529451929750600160a060020a0380891696506341976e099592169363aa9239f593602480850194929391928390030190829087803b156100005760325a03f11561000057505050604051805190602001506000604051602001526040518260e060020a0281526004018082600160a060020a03168152602001915050602060405180830381600087803b156100005760325a03f1156100005750506040515184810298909801979150505b84600101945061103c565b5b50505050505090565b6000600061128561097e565b60085490915015156112a157670de0b6b3a764000091506112ca565b8015156112b857670de0b6b3a764000091506112ca565b60085460095482028115610000570491505b5b6009829055600881905542600a555b5090565b600160a060020a038083166000908152600160209081526040808320938516835292905220545b92915050565b60125481565b60135481565b80151561132357610000565b5b50565b600082820161134484821080159061133f5750838210155b611317565b8091505b5092915050565b600061135d83831115611317565b508082035b9291505056",
    "events": {
      "0xf8495c533745eb3efa4d74ccdbbd0938e9d1e88add51cdc7db168a9f15a73736": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "buyer",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "numShares",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "sharePrice",
            "type": "uint256"
          }
        ],
        "name": "SharesCreated",
        "type": "event"
      },
      "0x6d1ea56dcd6dcf937743a4f926190b72632e8d241b3939423c443d3ad1d309d4": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "seller",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "numShares",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "sharePrice",
            "type": "uint256"
          }
        ],
        "name": "SharesAnnihilated",
        "type": "event"
      },
      "0xbb28353e4598c3b9199101a66e0989549b659a59a54d2c27fbb183f1932c8e6d": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Refund",
        "type": "event"
      },
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "_from",
            "type": "address"
          },
          {
            "indexed": true,
            "name": "_to",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "Transfer",
        "type": "event"
      },
      "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925": {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "_owner",
            "type": "address"
          },
          {
            "indexed": true,
            "name": "_spender",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "_value",
            "type": "uint256"
          }
        ],
        "name": "Approval",
        "type": "event"
      }
    },
    "updated_at": 1482327282277
  }
};

  Contract.checkNetwork = function(callback) {
    var self = this;

    if (this.network_id != null) {
      return callback();
    }

    this.web3.version.network(function(err, result) {
      if (err) return callback(err);

      var network_id = result.toString();

      // If we have the main network,
      if (network_id == "1") {
        var possible_ids = ["1", "live", "default"];

        for (var i = 0; i < possible_ids.length; i++) {
          var id = possible_ids[i];
          if (Contract.all_networks[id] != null) {
            network_id = id;
            break;
          }
        }
      }

      if (self.all_networks[network_id] == null) {
        return callback(new Error(self.name + " error: Can't find artifacts for network id '" + network_id + "'"));
      }

      self.setNetwork(network_id);
      callback();
    })
  };

  Contract.setNetwork = function(network_id) {
    var network = this.all_networks[network_id] || {};

    this.abi             = this.prototype.abi             = network.abi;
    this.unlinked_binary = this.prototype.unlinked_binary = network.unlinked_binary;
    this.address         = this.prototype.address         = network.address;
    this.updated_at      = this.prototype.updated_at      = network.updated_at;
    this.links           = this.prototype.links           = network.links || {};
    this.events          = this.prototype.events          = network.events || {};

    this.network_id = network_id;
  };

  Contract.networks = function() {
    return Object.keys(this.all_networks);
  };

  Contract.link = function(name, address) {
    if (typeof name == "function") {
      var contract = name;

      if (contract.address == null) {
        throw new Error("Cannot link contract without an address.");
      }

      Contract.link(contract.contract_name, contract.address);

      // Merge events so this contract knows about library's events
      Object.keys(contract.events).forEach(function(topic) {
        Contract.events[topic] = contract.events[topic];
      });

      return;
    }

    if (typeof name == "object") {
      var obj = name;
      Object.keys(obj).forEach(function(name) {
        var a = obj[name];
        Contract.link(name, a);
      });
      return;
    }

    Contract.links[name] = address;
  };

  Contract.contract_name   = Contract.prototype.contract_name   = "Core";
  Contract.generated_with  = Contract.prototype.generated_with  = "3.2.0";

  // Allow people to opt-in to breaking changes now.
  Contract.next_gen = false;

  var properties = {
    binary: function() {
      var binary = Contract.unlinked_binary;

      Object.keys(Contract.links).forEach(function(library_name) {
        var library_address = Contract.links[library_name];
        var regex = new RegExp("__" + library_name + "_*", "g");

        binary = binary.replace(regex, library_address.replace("0x", ""));
      });

      return binary;
    }
  };

  Object.keys(properties).forEach(function(key) {
    var getter = properties[key];

    var definition = {};
    definition.enumerable = true;
    definition.configurable = false;
    definition.get = getter;

    Object.defineProperty(Contract, key, definition);
    Object.defineProperty(Contract.prototype, key, definition);
  });

  bootstrap(Contract);

  if (typeof module != "undefined" && typeof module.exports != "undefined") {
    module.exports = Contract;
  } else {
    // There will only be one version of this contract in the browser,
    // and we can use that.
    window.Core = Contract;
  }
})();
