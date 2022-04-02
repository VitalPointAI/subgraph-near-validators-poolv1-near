import { near, log, json, JSONValueKind, BigInt } from "@graphprotocol/graph-ts";
import { CreateDAO, InactivateDAO } from "../generated/schema";

export function handleReceipt(receipt: near.ReceiptWithOutcome): void {
  const actions = receipt.receipt.actions;
  
  for (let i = 0; i < actions.length; i++) {
    handleAction(
      actions[i], 
      receipt.receipt, 
      receipt.block.header,
      receipt.outcome,
      receipt.receipt.signerPublicKey
      );
  }
}

function handleAction(
  action: near.ActionValue,
  receipt: near.ActionReceipt,
  blockHeader: near.BlockHeader,
  outcome: near.ExecutionOutcome,
  publicKey: near.PublicKey
): void {
  
  if (action.kind != near.ActionKind.FUNCTION_CALL) {
    log.info("Early return: {}", ["Not a function call"]);
    return;
  } 
  
  const functionCall = action.toFunctionCall();

  if (functionCall.methodName == "createDAO") {
    const receiptId = receipt.id.toBase58()
    let logs = new CreateDAO(`${receiptId}`)

    // Standard receipt properties
    logs.blockTime = BigInt.fromU64(blockHeader.timestampNanosec/1000000)
    logs.blockHeight = BigInt.fromU64(blockHeader.height)
    logs.blockHash = blockHeader.hash.toBase58()
    logs.predecessorId = receipt.predecessorId
    logs.receiverId = receipt.receiverId
    logs.signerId = receipt.signerId
    logs.signerPublicKey = publicKey.bytes.toBase58()
    logs.gasBurned = BigInt.fromU64(outcome.gasBurnt)
    logs.tokensBurned = outcome.tokensBurnt
    logs.outcomeId = outcome.id.toBase58()
    logs.executorId = outcome.executorId
    logs.outcomeBlockHash = outcome.blockHash.toBase58()

    // Log Parsing
    if(outcome.logs !=null && outcome.logs.length > 0){        
        let parsed = json.fromString(outcome.logs[0])
        if(parsed.kind == JSONValueKind.OBJECT){

          let entry = parsed.toObject()

          //EVENT_JSON
          let eventJSON = entry.entries[0].value.toObject()

          //standard, version, event (these stay the same for a NEP 171 emmitted log)
          for(let i = 0; i < eventJSON.entries.length; i++){
            let key = eventJSON.entries[i].key.toString()
            switch (true) {
              case key == 'standard':
                logs.standard = eventJSON.entries[i].value.toString()
                break
              case key == 'event':
                logs.event = eventJSON.entries[i].value.toString()
                break
              case key == 'version':
                logs.version = eventJSON.entries[i].value.toString()
                break
            }
            
            //data
            let data = eventJSON.entries[0].value.toObject()
            for(let i = 0; i < data.entries.length; i++){
              let key = data.entries[i].key.toString()
              switch (true) {
                case key == 'status':
                  logs.status = data.entries[i].value.toString()
                  break
                case key == 'did':
                  logs.did = data.entries[i].value.toString()
                  break
                case key == 'deposit':
                  logs.deposit = data.entries[i].value.toString()
                  break
                case key == 'created':
                  logs.created = data.entries[i].value.toBigInt()
                  break
                case key == 'summoner':
                  logs.summoner = data.entries[i].value.toString()
                  break
              }
            }
          }
        }
        logs.save()
    }      
  } else {
    log.info("Not processed - FunctionCall is: {}", [functionCall.methodName]);
  }

  if (functionCall.methodName == "inactivateDAO") {
    const receiptId = receipt.id.toBase58()
    let logs = new InactivateDAO(`${receiptId}`)

    // Standard receipt properties
    logs.blockTime = BigInt.fromU64(blockHeader.timestampNanosec/1000000)
    logs.blockHeight = BigInt.fromU64(blockHeader.height)
    logs.blockHash = blockHeader.hash.toBase58()
    logs.predecessorId = receipt.predecessorId
    logs.receiverId = receipt.receiverId
    logs.signerId = receipt.signerId
    logs.signerPublicKey = publicKey.bytes.toBase58()
    logs.gasBurned = BigInt.fromU64(outcome.gasBurnt)
    logs.tokensBurned = outcome.tokensBurnt
    logs.outcomeId = outcome.id.toBase58()
    logs.executorId = outcome.executorId
    logs.outcomeBlockHash = outcome.blockHash.toBase58()

    // Log Parsing
    if(outcome.logs !=null && outcome.logs.length > 0){        
        let parsed = json.fromString(outcome.logs[0])
        if(parsed.kind == JSONValueKind.OBJECT){

          let entry = parsed.toObject()

          //EVENT_JSON
          let eventJSON = entry.entries[0].value.toObject()

          //standard, version, event (these stay the same for a NEP 171 emmitted log)
          for(let i = 0; i < eventJSON.entries.length; i++){
            let key = eventJSON.entries[i].key.toString()
            switch (true) {
              case key == 'standard':
                logs.standard = eventJSON.entries[i].value.toString()
                break
              case key == 'event':
                logs.event = eventJSON.entries[i].value.toString()
                break
              case key == 'version':
                logs.version = eventJSON.entries[i].value.toString()
                break
            }
            
            //data
            let data = eventJSON.entries[0].value.toObject()
            for(let i = 0; i < data.entries.length; i++){
              let key = data.entries[i].key.toString()
              switch (true) {
                case key == 'contractId':
                  logs.contractId = data.entries[i].value.toString()
                  break
                case key == 'status':
                  logs.status = data.entries[i].value.toString()
                  break
                case key == 'deactivated':
                  logs.deactivated = data.entries[i].value.toBigInt()
                  break
              }
            }
          }
        }
        logs.save()
    }      
  } else {
    log.info("Not processed - FunctionCall is: {}", [functionCall.methodName]);
  }

  
}
