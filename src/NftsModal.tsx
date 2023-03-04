import React from "react";
import { yellow } from "@material-ui/core/colors";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";
import Chip from "@material-ui/core/Chip";
import Grid from "@material-ui/core/Grid";
import styled from "styled-components";

import { Nft, NftWithToken } from "@metaplex-foundation/js";
export const Action = styled.button`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 10px 16px;
  gap: 10px;
  background: var(--primary);
  border-radius: 4px;
  border: none;
  font-family: 'Plus Jakarta Sans';
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 150%;
  text-transform: uppercase;
  color: var(--white);
  justify-content: center;
  transition: all linear 0.3s;

  :hover {
    border: none;
    outline: none !important;
    background: #d09a69;
  }
  :not(disabled) {
    cursor: pointer;
  }

  :not(disabled):hover {
    outline: 1px solid var(--title-text-color);
  }
`;
export default function NftsModal({
  mintedItems,
  setMintedItems,
  openOnSolscan
}: {
  mintedItems: (Nft | NftWithToken)[];
  setMintedItems: any;
  openOnSolscan: (key: string) => void
}) {
  const handleClose = () => {
    setMintedItems([]);
  };

  return (
    <Dialog
      open={!!mintedItems.length}
      keepMounted
      onClose={handleClose}
      aria-labelledby="alert-dialog-slide-title"
      aria-describedby="alert-dialog-slide-description"
      maxWidth={"md"}
    >
      <DialogActions>
        <DialogTitle id="alert-dialog-slide-title">
          Congratulations you just minted:
        </DialogTitle>
        <Action onClick={handleClose}>Close</Action>  
      </DialogActions>
      
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          <Grid container spacing={1}>
            {mintedItems.map((nft, key) => (
              <Grid item xs={4} key={key}>
                <Card>
                  <CardActionArea>
                    {nft.json.image && (
                      <CardMedia
                        component="img"
                        //   alt="Contemplative Reptile"
                        //   height="140"
                        image={nft.json.image}
                        //   title="Contemplative Reptile"
                      />
                    )}
                    <CardContent>
                      {nft.json.name && (
                        <Typography gutterBottom variant="h5" component="h2">
                          {nft.json.name}
                        </Typography>
                      )}
                      {nft.json.description && (
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          component="p"
                        >
                          {nft.json.description}
                        </Typography>
                      )}
                    </CardContent>
                    <CardContent>
                      {nft.json.attributes?.map(({ trait_type, value }) => (
                        <Chip
                          label={`${trait_type}: ${value}`}
                          variant="outlined"
                          key={trait_type}
                          style={{margin: 2}}
                        />
                      ))}
                    </CardContent>
                  </CardActionArea>
                  <CardActions >
                    <Action style={{width: "100%"}} onClick={() => openOnSolscan(nft.address.toString())}>View on solscan</Action>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
}
