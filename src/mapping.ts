import { near, log, json, JSONValueKind, BigInt } from "@graphprotocol/graph-ts";
import { Ping, Withdraw, StakeAll, Stake, DepositAndStake, WithdrawAll, Unstake, UnstakeAll, Deposit, DepositToStakingPool } from "../generated/schema";

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

  if (functionCall.methodName == "deposit_and_stake") {
    const receiptId = receipt.id.toBase58()
    let logs = new DepositAndStake(`${receiptId}`)

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
      if(outcome.logs.length == 5){
        log.info("outcome log is: {}", [outcome.logs[0]])
        logs.log = outcome.logs[0]
        let firstLog = outcome.logs[0]
        let secondLog = outcome.logs[1]
        let thirdLog = outcome.logs[2]
        let fourthLog = outcome.logs[3]
        let fifthLog = outcome.logs[4]

        let firstParts = firstLog.split(' ')
        logs.epoch = firstParts[1].split(':')[0]
        logs.rewardsReceived = firstParts[7]
        logs.newContractStakedBalance = firstParts[14].split('.')[0]
        logs.newContractTotalShares = firstParts[19]

        let secondParts = secondLog.split(' ')
        logs.totalRewardsFee = secondParts[4]
        
        let thirdParts = thirdLog.split(' ')
        logs.accountIdDepositing = thirdParts[0].split('@')[1]
        logs.deposit = thirdParts[2]
        logs.newUnstakedBalance = thirdParts[7]

        let fourthParts = fourthLog.split(' ')
        logs.accountIdStaking = fourthParts[0].split('@')[1]
        logs.staking = fourthParts[2].split('.')[0]
        logs.receivedStakingShares = fourthParts[4]
        logs.unstakedBalance = fourthParts[9]
        logs.stakingShares = fourthParts[13]

        let fifthParts = fifthLog.split(' ')
        logs.contractTotalStakedBalance = fifthParts[5].split('.')[0]
        logs.contractTotalShares = fifthParts[10]

        logs.save()
      }

      if(outcome.logs.length == 3){
        log.info("outcome log is: {}", [outcome.logs[0]])
        let firstLog = outcome.logs[0]
        let secondLog = outcome.logs[1]
        let thirdLog = outcome.logs[2]
        
        let firstParts = firstLog.split(' ')
        logs.accountIdDepositing = firstParts[0].split('@')[1]
        logs.deposit = firstParts[2]
        logs.newUnstakedBalance = firstParts[7]

        let secondParts = secondLog.split(' ')
        logs.accountIdStaking = secondParts[0].split('@')[1]
        logs.staking = secondParts[2]
        logs.receivedStakingShares = secondParts[4]
        logs.unstakedBalance = secondParts[9]
        logs.stakingShares = secondParts[13]

        let thirdParts = thirdLog.split(' ')
        logs.contractTotalStakedBalance = thirdParts[5].split('.')[0]
        logs.contractTotalShares = thirdParts[10]
       
        logs.save()
      }  
        
    }      
  } else {
    log.info("Not processed - FunctionCall is: {}", [functionCall.methodName]);
  }

  if (functionCall.methodName == "deposit") {
    const receiptId = receipt.id.toBase58()
    let logs = new Deposit(`${receiptId}`)

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
      if(outcome.logs.length == 5){
        log.info("outcome log is: {}", [outcome.logs[0]])
        logs.log = outcome.logs[0]
        let firstLog = outcome.logs[0]
        let secondLog = outcome.logs[1]
        let thirdLog = outcome.logs[2]
        let fourthLog = outcome.logs[3]
        let fifthLog = outcome.logs[4]

        let firstParts = firstLog.split(' ')
        logs.epoch = firstParts[1].split(':')[0]
        logs.rewardsReceived = firstParts[7]
        logs.newContractStakedBalance = firstParts[14].split('.')[0]
        logs.newContractTotalShares = firstParts[19]

        let secondParts = secondLog.split(' ')
        logs.totalRewardsFee = secondParts[4]
        
        let thirdParts = thirdLog.split(' ')
        logs.accountIdDepositing = thirdParts[0].split('@')[1]
        logs.deposit = thirdParts[2]
        logs.newUnstakedBalance = thirdParts[7]

        let fourthParts = fourthLog.split(' ')
        logs.accountIdStaking = fourthParts[0].split('@')[1]
        logs.staking = fourthParts[2].split('.')[0]
        logs.receivedStakingShares = fourthParts[4]
        logs.unstakedBalance = fourthParts[9]
        logs.stakingShares = fourthParts[13]

        let fifthParts = fifthLog.split(' ')
        logs.contractTotalStakedBalance = fifthParts[5].split('.')[0]
        logs.contractTotalShares = fifthParts[10]

        logs.save()
      }

      if(outcome.logs.length == 3 && outcome.logs[0].split(' ')[0] == 'Epoch'){
        log.info("outcome log is: {}", [outcome.logs[0]])
        logs.log = outcome.logs[0]
        let firstLog = outcome.logs[0]
        let secondLog = outcome.logs[1]
        let thirdLog = outcome.logs[2]
       
        let firstParts = firstLog.split(' ')
        logs.epoch = firstParts[1].split(':')[0]
        logs.rewardsReceived = firstParts[7]
        logs.newContractStakedBalance = firstParts[14].split('.')[0]
        logs.newContractTotalShares = firstParts[19]

        let secondParts = secondLog.split(' ')
        logs.totalRewardsFee = secondParts[4]
        
        let thirdParts = thirdLog.split(' ')
        logs.accountIdDepositing = thirdParts[0].split('@')[1]
        logs.deposit = thirdParts[2]
        logs.newUnstakedBalance = thirdParts[7]

        logs.save()
      }

      if(outcome.logs.length == 3 && outcome.logs[0].split(' ')[0] != 'Epoch'){
        log.info("outcome log is: {}", [outcome.logs[0]])
        let firstLog = outcome.logs[0]
        let secondLog = outcome.logs[1]
        let thirdLog = outcome.logs[2]
        
        let firstParts = firstLog.split(' ')
        logs.accountIdDepositing = firstParts[0].split('@')[1]
        logs.deposit = firstParts[2]
        logs.newUnstakedBalance = firstParts[7]

        let secondParts = secondLog.split(' ')
        logs.accountIdStaking = secondParts[0].split('@')[1]
        logs.staking = secondParts[2]
        logs.receivedStakingShares = secondParts[4]
        logs.unstakedBalance = secondParts[9]
        logs.stakingShares = secondParts[13]

        let thirdParts = thirdLog.split(' ')
        logs.contractTotalStakedBalance = thirdParts[5].split('.')[0]
        logs.contractTotalShares = thirdParts[10]
       
        logs.save()
      }  

      if(outcome.logs.length == 1){
        log.info("outcome log is: {}", [outcome.logs[0]])
        let firstLog = outcome.logs[0]
        
        let firstParts = firstLog.split(' ')
        logs.accountIdDepositing = firstParts[0].split('@')[1]
        logs.deposit = firstParts[2]
        logs.newUnstakedBalance = firstParts[7]
       
        logs.save()
      }
    }      
  } else {
    log.info("Not processed - FunctionCall is: {}", [functionCall.methodName]);
  }

  if (functionCall.methodName == "ping"
  || functionCall.methodName == "update_staking_key"
  || functionCall.methodName == "update_reward_fee_fraction"
  || functionCall.methodName == "pause_staking"
  || functionCall.methodName == "resume_staking"
  ) {
    const receiptId = receipt.id.toBase58()
    let logs = new Ping(`${receiptId}`)

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
        log.info("outcome log is: {}", [outcome.logs[0]])
        let firstLog = outcome.logs[0]
        
        let firstParts = firstLog.split(' ')
        logs.epoch = firstParts[1].split(':')[0]
        logs.rewardsReceived = firstParts[7]
        logs.newContractStakedBalance = firstParts[14].split('.')[0]
        logs.newContractTotalShares = firstParts[19]
       
        logs.save()
    }      
  } else {
    log.info("Not processed - FunctionCall is: {}", [functionCall.methodName]);
  }

  if (functionCall.methodName == "withdraw_all") {
    const receiptId = receipt.id.toBase58()
    let logs = new WithdrawAll(`${receiptId}`)

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
      if(outcome.logs.length == 2){
        let firstLog = outcome.logs[0]
        let secondLog = outcome.logs[1]

        let firstParts = firstLog.split(' ')
        logs.epoch = firstParts[1].split(':')[0]
        logs.rewardsReceived = firstParts[7]
        logs.newContractStakedBalance = firstParts[14].split('.')[0]
        logs.newContractTotalShares = firstParts[19]

        let secondParts = secondLog.split(' ')
        logs.accountId = secondParts[0].split('@')[1]
        logs.amount = secondParts[2]
        logs.newUnstakedBalance = secondParts[7]
      }
      if(outcome.logs.length == 1){
        log.info("outcome log is: {}", [outcome.logs[0]])
        let firstLog = outcome.logs[0]
        
        let firstParts = firstLog.split(' ')
        logs.accountId = firstParts[0].split('@')[1]
        logs.amount = firstParts[2]
        logs.newUnstakedBalance = firstParts[7]
       
        logs.save()
      }  
    }      
  } else {
    log.info("Not processed - FunctionCall is: {}", [functionCall.methodName]);
  }

  if (functionCall.methodName == "withdraw") {
    const receiptId = receipt.id.toBase58()
    let logs = new Withdraw(`${receiptId}`)

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
      if(outcome.logs.length == 2){
        let firstLog = outcome.logs[0]
        let secondLog = outcome.logs[1]

        let firstParts = firstLog.split(' ')
        logs.epoch = firstParts[1].split(':')[0]
        logs.rewardsReceived = firstParts[7]
        logs.newContractStakedBalance = firstParts[14].split('.')[0]
        logs.newContractTotalShares = firstParts[19]

        let secondParts = secondLog.split(' ')
        logs.accountId = secondParts[0].split('@')[1]
        logs.amount = secondParts[2]
        logs.newUnstakedBalance = secondParts[7]
      }
      if(outcome.logs.length == 1){
        log.info("outcome log is: {}", [outcome.logs[0]])
        let firstLog = outcome.logs[0]
        
        let firstParts = firstLog.split(' ')
        logs.accountId = firstParts[0].split('@')[1]
        logs.amount = firstParts[2]
        logs.newUnstakedBalance = firstParts[7]
       
        logs.save()
      }    
    }      
  } else {
    log.info("Not processed - FunctionCall is: {}", [functionCall.methodName]);
  }

  if (functionCall.methodName == "stake_all") {
    const receiptId = receipt.id.toBase58()
    let logs = new StakeAll(`${receiptId}`)

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
      if(outcome.logs.length == 3 && outcome.logs[0].split(' ')[0] == 'Epoch'){
        let firstLog = outcome.logs[0]
        let secondLog = outcome.logs[1]
        let thirdLog = outcome.logs[2]

        let firstParts = firstLog.split(' ')
        logs.epoch = firstParts[1].split(':')[0]
        logs.rewardsReceived = firstParts[7]
        logs.newContractStakedBalance = firstParts[14].split('.')[0]
        logs.newContractTotalShares = firstParts[19]

        let secondParts = secondLog.split(' ')
        logs.accountIdStaking = secondParts[0].split('@')[1]
        logs.staking = secondParts[2]
        logs.receivedStakingShares = secondParts[4]
        logs.unstakedBalance = secondParts[9]
        logs.stakingShares = secondParts[13]

        let thirdParts = thirdLog.split(' ')
        logs.contractTotalStakedBalance = thirdParts[5].split('.')[0]
        logs.contractTotalShares = thirdParts[10]
      }
      if(outcome.logs.length == 3){
        log.info("outcome log is: {}", [outcome.logs[0]])
        let firstLog = outcome.logs[0]
        let secondLog = outcome.logs[1]
        let thirdLog = outcome.logs[2]
        
        let firstParts = firstLog.split(' ')
        logs.accountIdDepositing = firstParts[0].split('@')[1]
        logs.deposit = firstParts[2]
        logs.newUnstakedBalance = firstParts[7]

        let secondParts = secondLog.split(' ')
        logs.accountIdStaking = secondParts[0].split('@')[1]
        logs.staking = secondParts[2]
        logs.receivedStakingShares = secondParts[4]
        logs.unstakedBalance = secondParts[9]
        logs.stakingShares = secondParts[13]

        let thirdParts = thirdLog.split(' ')
        logs.contractTotalStakedBalance = thirdParts[5].split('.')[0]
        logs.contractTotalShares = thirdParts[10]
       
        logs.save()
      }
      if(outcome.logs.length == 2){
        log.info("outcome log is: {}", [outcome.logs[0]])
        let firstLog = outcome.logs[0]
        let secondLog = outcome.logs[1]

        let firstParts = firstLog.split(' ')
        logs.accountIdStaking = firstParts[0].split('@')[1]
        logs.staking = firstParts[2]
        logs.receivedStakingShares = firstParts[4]
        logs.unstakedBalance = firstParts[9]
        logs.stakingShares = firstParts[13]

        let secondParts = secondLog.split(' ')
        logs.contractTotalStakedBalance = secondParts[5].split('.')[0]
        logs.contractTotalShares = secondParts[10]
       
        logs.save()
      }  
    }      
  } else {
    log.info("Not processed - FunctionCall is: {}", [functionCall.methodName]);
  }  

  if (functionCall.methodName == "stake") {
    const receiptId = receipt.id.toBase58()
    let logs = new Stake(`${receiptId}`)

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
      if(outcome.logs.length == 4){
        let firstLog = outcome.logs[0]
        let secondLog = outcome.logs[1]
        let thirdLog = outcome.logs[2]

        let firstParts = firstLog.split(' ')
        logs.epoch = firstParts[1].split(':')[0]
        logs.rewardsReceived = firstParts[7]
        logs.newContractStakedBalance = firstParts[14].split('.')[0]
        logs.newContractTotalShares = firstParts[19]

        let secondParts = secondLog.split(' ')
        logs.accountIdStaking = secondParts[0].split('@')[1]
        logs.staking = secondParts[2]
        logs.receivedStakingShares = secondParts[4]
        logs.unstakedBalance = secondParts[9]
        logs.stakingShares = secondParts[13]

        let thirdParts = thirdLog.split(' ')
        logs.contractTotalStakedBalance = thirdParts[5].split('.')[0]
        logs.contractTotalShares = thirdParts[10]
      }
      if(outcome.logs.length == 3){
        log.info("outcome log is: {}", [outcome.logs[0]])
        let firstLog = outcome.logs[0]
        let secondLog = outcome.logs[1]
        let thirdLog = outcome.logs[2]
        
        let firstParts = firstLog.split(' ')
        logs.accountIdDepositing = firstParts[0].split('@')[1]
        logs.deposit = firstParts[2]
        logs.newUnstakedBalance = firstParts[7]

        let secondParts = secondLog.split(' ')
        logs.accountIdStaking = secondParts[0].split('@')[1]
        logs.staking = secondParts[2]
        logs.receivedStakingShares = secondParts[4]
        logs.unstakedBalance = secondParts[9]
        logs.stakingShares = secondParts[13]

        let thirdParts = thirdLog.split(' ')
        logs.contractTotalStakedBalance = thirdParts[5].split('.')[0]
        logs.contractTotalShares = thirdParts[10]
       
        logs.save()
      }
      if(outcome.logs.length == 2){
        log.info("outcome log is: {}", [outcome.logs[0]])
        let firstLog = outcome.logs[0]
        let secondLog = outcome.logs[1]

        let firstParts = firstLog.split(' ')
        logs.accountIdStaking = firstParts[0].split('@')[1]
        logs.staking = firstParts[2]
        logs.receivedStakingShares = firstParts[4]
        logs.unstakedBalance = firstParts[9]
        logs.stakingShares = firstParts[13]

        let secondParts = secondLog.split(' ')
        logs.contractTotalStakedBalance = secondParts[5].split('.')[0]
        logs.contractTotalShares = secondParts[10]
       
        logs.save()
      } 
    }      
  } else {
    log.info("Not processed - FunctionCall is: {}", [functionCall.methodName]);
  }  

  if (functionCall.methodName == "unstake") {
    const receiptId = receipt.id.toBase58()
    let logs = new Unstake(`${receiptId}`)

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
      if(outcome.logs.length == 4){
        log.info("outcome log is: {}", [outcome.logs[0]])
        let firstLog = outcome.logs[0]
        let secondLog = outcome.logs[1]
        let thirdLog = outcome.logs[2]
        let fourthLog = outcome.logs[3]

        let firstParts = firstLog.split(' ')
        logs.epoch = firstParts[1].split(':')[0]
        logs.rewardsReceived = firstParts[7]
        logs.newContractStakedBalance = firstParts[14].split('.')[0]
        logs.newContractTotalShares = firstParts[19]

        let secondParts = secondLog.split(' ')
        logs.totalRewardsFee = secondParts[4]
        
        let thirdParts = thirdLog.split(' ')
        logs.accountId = thirdParts[0].split('@')[1]
        logs.amount = thirdParts[2].split('.')[0]
        logs.spentStakingShareAmount = thirdParts[4]
        logs.totalUnstakedBalance = thirdParts[8]
        logs.totalStakingShares = thirdParts[12]
        
        let fourthParts = fourthLog.split(' ')
        logs.contractTotalStakedBalance = fourthParts[5].split('.')[0]
        logs.contractTotalShares = fourthParts[10]
       
        logs.save()
      }

      if(outcome.logs.length == 2){
        log.info("outcome log is: {}", [outcome.logs[0]])
        let firstLog = outcome.logs[0]
        let secondLog = outcome.logs[1]
        
        let firstParts = firstLog.split(' ')
        logs.accountId = firstParts[0].split('@')[1]
        logs.amount = firstParts[2].split('.')[0]
        logs.spentStakingShareAmount = firstParts[4]
        logs.totalUnstakedBalance = firstParts[8]
        logs.totalStakingShares = firstParts[12]
        
        let secondParts = secondLog.split(' ')
        logs.contractTotalStakedBalance = secondParts[5].split('.')[0]
        logs.contractTotalShares = secondParts[10]
       
        logs.save()
      }  
    }      
  } else {
    log.info("Not processed - FunctionCall is: {}", [functionCall.methodName]);
  }

  if (functionCall.methodName == "unstake_all") {
    const receiptId = receipt.id.toBase58()
    let logs = new UnstakeAll(`${receiptId}`)

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
      if(outcome.logs.length == 4){
        log.info("outcome log is: {}", [outcome.logs[0]])
        let firstLog = outcome.logs[0]
        let secondLog = outcome.logs[1]
        let thirdLog = outcome.logs[2]
        let fourthLog = outcome.logs[3]

        let firstParts = firstLog.split(' ')
        logs.epoch = firstParts[1].split(':')[0]
        logs.rewardsReceived = firstParts[7]
        logs.newContractStakedBalance = firstParts[14].split('.')[0]
        logs.newContractTotalShares = firstParts[19]

        let secondParts = secondLog.split(' ')
        logs.totalRewardsFee = secondParts[4]
        
        let thirdParts = thirdLog.split(' ')
        logs.accountId = thirdParts[0].split('@')[1]
        logs.amount = thirdParts[2].split('.')[0]
        logs.spentStakingShareAmount = thirdParts[4]
        logs.totalUnstakedBalance = thirdParts[8]
        logs.totalStakingShares = thirdParts[12]
        
        let fourthParts = fourthLog.split(' ')
        logs.contractTotalStakedBalance = fourthParts[5].split('.')[0]
        logs.contractTotalShares = fourthParts[10]
       
        logs.save()
      }

      if(outcome.logs.length == 2){
        log.info("outcome log is: {}", [outcome.logs[0]])
        let firstLog = outcome.logs[0]
        let secondLog = outcome.logs[1]
        
        let firstParts = firstLog.split(' ')
        logs.accountId = firstParts[0].split('@')[1]
        logs.amount = firstParts[2].split('.')[0]
        logs.spentStakingShareAmount = firstParts[4]
        logs.totalUnstakedBalance = firstParts[8]
        logs.totalStakingShares = firstParts[12]
        
        let secondParts = secondLog.split(' ')
        logs.contractTotalStakedBalance = secondParts[5].split('.')[0]
        logs.contractTotalShares = secondParts[10]
       
        logs.save()
      }
    }      
  } else {
    log.info("Not processed - FunctionCall is: {}", [functionCall.methodName]);
  }  
}