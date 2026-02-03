

# channel name defaults to "mychannel"
CHANNEL_NAME="laurachannel"

echo $CHANNEL_NAME

# Generate Channel Genesis block

# configtxgen is the binary used 
# ThreeOrgsApplicationGenesis is the profile that will create the channel artifacts 
# Outputblock is where we are storing the genesis block
configtxgen -profile ThreeOrgsApplicationGenesis -configPath . -channelID $CHANNEL_NAME  -outputBlock ../../channel-artifacts/$CHANNEL_NAME.block

